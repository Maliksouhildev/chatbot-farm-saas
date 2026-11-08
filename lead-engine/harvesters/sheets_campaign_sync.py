# =============================================================================
# Lead Engine Campaign-Dedicated Google Sheets Sync Engine
# Automatically provisions dedicated worksheet tabs per campaign, applies
# standardized headers, sorts top-scoring leads to the top, and generates
# 1-click wa.me outreach links. Supports Google Sheets API v4 + Local CSV Cockpit.
# =============================================================================

import os
import csv
import json
import logging
import urllib.parse
from typing import List, Dict, Any, Optional
import httpx
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None
    RealDictCursor = None

from config import settings

logger = logging.getLogger("sheets_sync")
logger.setLevel(logging.INFO)

CAMPAIGN_HEADERS = [
    "Client ID",
    "Business Name",
    "Wilaya / City",
    "Phone (E.164)",
    "1-Click WhatsApp Link",
    "Instagram / Handle",
    "Website / Facebook",
    "Reliability Score (1-10)",
    "Detected Bottleneck",
    "Proposed Service",
    "Outreach Status",
    "AI Pitch Draft",
    "Created Date",
]


class SheetsCampaignSync:
    """
    Synchronizes campaigns and leads to dedicated Google Sheets tabs.
    Features automated top-score sorting and export fallbacks.
    """

    def __init__(self):
        self.spreadsheet_id = settings.GOOGLE_SHEETS_SPREADSHEET_ID or os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID")
        self.service_account_file = settings.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON or os.getenv("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON")
        self.data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "campaigns")
        os.makedirs(self.data_dir, exist_ok=True)

    def sync_campaign_leads(
        self,
        campaign_id: str,
        campaign_name: str,
        leads: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Main sync coordinator.
        Sorts leads by ai_fit_score descending, writes local structured CSV/JSON,
        and pushes to Google Sheets API if service account credentials exist.
        """
        # Sort leads with highest scoring prospects at the top
        sorted_leads = sorted(
            leads,
            key=lambda x: (x.get("ai_fit_score") or 0),
            reverse=True,
        )

        # Tab name sanitized for Google Sheets (max 100 chars, no special prohibited chars)
        clean_tab_name = "".join(c for c in f"{campaign_name[:30]}_{campaign_id[-8:]}" if c.isalnum() or c in [" ", "_", "-"]).strip()

        # 1. Export local CSV & JSON representation (Available immediately)
        local_csv_path, local_json_path = self._write_local_files(campaign_id, clean_tab_name, sorted_leads)

        # 2. Attempt Google Sheets API push if credentials configured
        remote_url = None
        sheets_synced = False
        if self.spreadsheet_id and self.service_account_file and os.path.exists(self.service_account_file):
            try:
                remote_url = self._push_to_google_sheets(clean_tab_name, sorted_leads)
                sheets_synced = bool(remote_url)
            except Exception as e:
                logger.warning(f"Google Sheets API sync failed: {e}. Local export remains intact.")

        # Fallback public or local reference URL
        final_sheet_url = remote_url or f"https://docs.google.com/spreadsheets/d/{self.spreadsheet_id or 'mock-sheet-id'}/edit"

        return {
            "status": "success",
            "campaign_id": campaign_id,
            "campaign_name": campaign_name,
            "tab_name": clean_tab_name,
            "total_leads": len(sorted_leads),
            "top_scoring_leads": sum(1 for l in sorted_leads if (l.get("ai_fit_score") or 0) >= 7),
            "google_sheet_url": final_sheet_url,
            "local_csv_path": local_csv_path,
            "local_json_path": local_json_path,
            "sheets_synced": sheets_synced,
        }

    def _write_local_files(
        self,
        campaign_id: str,
        tab_name: str,
        leads: List[Dict[str, Any]],
    ) -> (str, str):
        """Writes high-fidelity CSV and JSON artifacts for local inspection and downloads."""
        csv_filename = f"{campaign_id}_{tab_name}.csv".replace(" ", "_")
        json_filename = f"{campaign_id}_{tab_name}.json".replace(" ", "_")
        csv_path = os.path.join(self.data_dir, csv_filename)
        json_path = os.path.join(self.data_dir, json_filename)

        with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f)
            writer.writerow(CAMPAIGN_HEADERS)
            for lead in leads:
                phone = lead.get("contact_phone") or lead.get("contact_whatsapp") or ""
                pitch = lead.get("ai_pitch_draft") or ""
                wa_link = lead.get("whatsapp_direct_url")
                if not wa_link and phone:
                    clean_digits = "".join(filter(str.isdigit, phone))
                    wa_link = f"https://wa.me/{clean_digits}?text={urllib.parse.quote(pitch)}"

                writer.writerow([
                    lead.get("client_id", "N/A"),
                    lead.get("company_name") or lead.get("name", "Unknown Business"),
                    lead.get("location_wilaya", "Algeria"),
                    phone,
                    wa_link or "N/A",
                    lead.get("contact_instagram", "N/A"),
                    lead.get("website_url") or lead.get("contact_facebook", "N/A"),
                    lead.get("ai_fit_score", 5),
                    lead.get("detected_bottleneck") or "Manual order dispatch",
                    lead.get("proposed_service", "whatsapp_bot"),
                    lead.get("status", "new"),
                    pitch,
                    str(lead.get("created_at", ""))[:10],
                ])

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(leads, f, indent=2, ensure_ascii=False, default=str)

        logger.info(f"Local campaign sheets saved: {csv_path}")
        return csv_path, json_path

    def _push_to_google_sheets(self, tab_name: str, leads: List[Dict[str, Any]]) -> Optional[str]:
        """
        Connects to Google Sheets API using Service Account JSON via OAuth2 JWT flow.
        Creates tab if non-existent, writes headers, and dumps sorted rows.
        """
        # Read service account credentials
        with open(self.service_account_file, "r", encoding="utf-8") as f:
            sa_info = json.load(f)

        token = self._get_service_account_token(sa_info)
        if not token:
            logger.warning("Could not acquire Google OAuth2 access token.")
            return None

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        # 1. Add new worksheet tab
        add_sheet_url = f"https://sheets.googleapis.com/v4/spreadsheets/{self.spreadsheet_id}:batchUpdate"
        sheet_id = None
        add_body = {
            "requests": [
                {
                    "addSheet": {
                        "properties": {
                            "title": tab_name,
                            "gridProperties": {"frozenRowCount": 1},
                        }
                    }
                }
            ]
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(add_sheet_url, headers=headers, json=add_body)
            if resp.status_code == 200:
                sheet_id = resp.json()["replies"][0]["addSheet"]["properties"]["sheetId"]
            else:
                logger.debug(f"Add sheet response: {resp.text} (Tab might already exist)")

            # 2. Format rows
            rows = [CAMPAIGN_HEADERS]
            for lead in leads:
                phone = lead.get("contact_phone") or lead.get("contact_whatsapp") or ""
                pitch = lead.get("ai_pitch_draft") or ""
                wa_link = lead.get("whatsapp_direct_url")
                if not wa_link and phone:
                    clean_digits = "".join(filter(str.isdigit, phone))
                    wa_link = f"https://wa.me/{clean_digits}?text={urllib.parse.quote(pitch)}"

                rows.append([
                    str(lead.get("client_id", "N/A")),
                    str(lead.get("company_name") or lead.get("name", "Unknown Business")),
                    str(lead.get("location_wilaya", "Algeria")),
                    str(phone),
                    str(wa_link or "N/A"),
                    str(lead.get("contact_instagram", "N/A")),
                    str(lead.get("website_url") or lead.get("contact_facebook", "N/A")),
                    int(lead.get("ai_fit_score", 5)),
                    str(lead.get("detected_bottleneck") or "Manual order dispatch"),
                    str(lead.get("proposed_service", "whatsapp_bot")),
                    str(lead.get("status", "new")),
                    str(pitch),
                    str(lead.get("created_at", ""))[:10],
                ])

            # 3. Write rows to Google Sheet tab
            update_url = f"https://sheets.googleapis.com/v4/spreadsheets/{self.spreadsheet_id}/values/'{tab_name}'!A1?valueInputOption=USER_ENTERED"
            update_body = {"range": f"'{tab_name}'!A1", "majorDimension": "ROWS", "values": rows}
            put_resp = client.put(update_url, headers=headers, json=update_body)
            if put_resp.status_code == 200:
                logger.info(f"Successfully synced {len(rows)-1} leads to Google Sheet tab '{tab_name}'")
                gid_param = f"#gid={sheet_id}" if sheet_id is not None else ""
                return f"https://docs.google.com/spreadsheets/d/{self.spreadsheet_id}/edit{gid_param}"
            else:
                logger.error(f"Failed to write rows to Google Sheets: {put_resp.text}")
                return None

    def _get_service_account_token(self, sa_info: Dict[str, Any]) -> Optional[str]:
        """Exchanges service account private key for Google OAuth2 access token."""
        try:
            import time
            import jwt  # PyJWT if installed
            now = int(time.time())
            payload = {
                "iss": sa_info["client_email"],
                "sub": sa_info["client_email"],
                "aud": "https://oauth2.googleapis.com/token",
                "iat": now,
                "exp": now + 3600,
                "scope": "https://www.googleapis.com/auth/spreadsheets",
            }
            signed_jwt = jwt.encode(payload, sa_info["private_key"], algorithm="RS256")
            token_resp = httpx.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                    "assertion": signed_jwt,
                },
                timeout=10.0,
            )
            if token_resp.status_code == 200:
                return token_resp.json().get("access_token")
        except Exception as e:
            logger.debug(f"OAuth2 service account token error: {e}")
        return None


sheets_campaign_sync = SheetsCampaignSync()
