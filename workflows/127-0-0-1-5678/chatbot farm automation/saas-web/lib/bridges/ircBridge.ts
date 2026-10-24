import tls from "tls";
import net from "net";

export interface IrcMessage {
  id: string;
  sender: "customer" | "operator";
  senderNick: string;
  text: string;
  time: string;
  channel: string;
}

export interface IrcConversation {
  id: string;
  appId: "irc";
  name: string;
  handleOrPhone: string;
  avatarText: string;
  avatarBg: string;
  statusText: string;
  spend: string;
  lastMessage: string;
  time: string;
  lastMessageTime: string;
  timestamp: number;
  unreadCount: number;
  messages: Array<{
    id: string;
    sender: "customer" | "operator";
    text: string;
    time: string;
    seen: boolean;
  }>;
}

// In-memory active IRC sessions cache for live background connection
const activeIrcSessions: Record<
  string,
  {
    socket: net.Socket | tls.TLSSocket;
    channel: string;
    nick: string;
    messages: IrcMessage[];
    users: Set<string>;
  }
> = {};

/**
 * Connects directly to an IRC network via RFC 2812 TCP/TLS protocol
 */
export async function connectIrcBridge(params: {
  host?: string;
  port?: number;
  nick: string;
  channel: string;
  password?: string;
}): Promise<{
  success: boolean;
  sessionKey?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    try {
      const host = params.host || "irc.libera.chat";
      const port = params.port || 6697;
      const cleanNick = params.nick.trim().replace(/[^a-zA-Z0-9_\-\[\]\\`^{}]/g, "") || "chatbot_user";
      const cleanChan = params.channel.startsWith("#") ? params.channel : `#${params.channel}`;
      const sessionKey = `${host}:${port}:${cleanChan}`;

      if (activeIrcSessions[sessionKey]) {
        return resolve({ success: true, sessionKey });
      }

      const isTls = port === 6697 || port === 9999 || port === 7000;
      let socket: net.Socket | tls.TLSSocket;

      const onConnect = () => {
        console.log(`[IrcBridge] Connected to ${host}:${port}`);
        if (params.password) {
          socket.write(`PASS ${params.password}\r\n`);
        }
        socket.write(`NICK ${cleanNick}\r\n`);
        socket.write(`USER ${cleanNick} 0 * :Chatbot Farm Merchant\r\n`);
      };

      if (isTls) {
        socket = tls.connect(port, host, { rejectUnauthorized: false }, onConnect);
      } else {
        socket = net.connect(port, host, onConnect);
      }

      socket.setEncoding("utf-8");

      const sessionData = {
        socket,
        channel: cleanChan,
        nick: cleanNick,
        messages: [] as IrcMessage[],
        users: new Set<string>(),
      };
      activeIrcSessions[sessionKey] = sessionData;

      let hasJoined = false;

      socket.on("data", (chunk: string) => {
        const lines = chunk.split("\r\n");
        for (const line of lines) {
          if (!line.trim()) continue;

          // PING / PONG keepalive
          if (line.startsWith("PING")) {
            const pongResp = line.replace("PING", "PONG");
            socket.write(`${pongResp}\r\n`);
            continue;
          }

          // RPL_WELCOME (001) -> Join configured channel
          if (line.includes(" 001 ") && !hasJoined) {
            hasJoined = true;
            socket.write(`JOIN ${cleanChan}\r\n`);
            console.log(`[IrcBridge] Joined channel ${cleanChan}`);
            resolve({ success: true, sessionKey });
          }

          // PRIVMSG -> incoming channel message
          if (line.includes(" PRIVMSG ")) {
            const match = line.match(/^:([^!]+)![^ ]+ PRIVMSG ([^ ]+) :(.+)$/);
            if (match) {
              const [, senderNick, targetChan, msgText] = match;
              const isOperator = senderNick.toLowerCase() === cleanNick.toLowerCase();
              const date = new Date();
              const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              sessionData.messages.push({
                id: `irc_msg_${Date.now()}_${Math.random()}`,
                sender: isOperator ? "operator" : "customer",
                senderNick,
                text: msgText,
                time: timeStr,
                channel: targetChan,
              });
            }
          }
        }
      });

      socket.on("error", (err) => {
        console.error(`[IrcBridge] Socket error:`, err);
        delete activeIrcSessions[sessionKey];
        resolve({ success: false, error: err.message });
      });

      // Safety timeout
      setTimeout(() => {
        if (!hasJoined) {
          resolve({ success: true, sessionKey }); // Return success with connected socket
        }
      }, 5000);
    } catch (err: any) {
      resolve({ success: false, error: err.message });
    }
  });
}

/**
 * Fetches real IRC channel discussion
 */
export async function fetchRealIrcMessages(params: {
  host?: string;
  port?: number;
  channel?: string;
}): Promise<{
  success: boolean;
  chats: IrcConversation[];
  error?: string;
}> {
  const host = params.host || "irc.libera.chat";
  const port = params.port || 6697;
  const channel = (params.channel || "#chatbot-farm").startsWith("#") ? params.channel || "#chatbot-farm" : `#${params.channel}`;
  const sessionKey = `${host}:${port}:${channel}`;

  const session = activeIrcSessions[sessionKey];
  if (!session) {
    return {
      success: true,
      chats: [],
    };
  }

  const messages = session.messages.map((m) => ({
    id: m.id,
    sender: m.sender,
    text: `[${m.senderNick}] ${m.text}`,
    time: m.time,
    seen: true,
  }));

  const lastMsg = messages[messages.length - 1];

  return {
    success: true,
    chats: [
      {
        id: `irc_${channel.replace(/[^a-zA-Z0-9_]/g, "_")}`,
        appId: "irc",
        name: channel,
        handleOrPhone: `${host}:${port} • ${channel}`,
        avatarText: "#",
        avatarBg: "#1E222A",
        statusText: `IRC Channel • ${host}`,
        spend: "0 DA",
        lastMessage: lastMsg ? lastMsg.text : "Connected to IRC Channel",
        time: lastMsg ? lastMsg.time : "Live",
        lastMessageTime: lastMsg ? lastMsg.time : "Live",
        timestamp: Date.now(),
        unreadCount: 0,
        messages,
      },
    ],
  };
}

/**
 * Sends a message to the real IRC channel
 */
export async function sendRealIrcMessage(params: {
  host?: string;
  port?: number;
  channel: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  const host = params.host || "irc.libera.chat";
  const port = params.port || 6697;
  const channel = params.channel.startsWith("#") ? params.channel : `#${params.channel}`;
  const sessionKey = `${host}:${port}:${channel}`;

  const session = activeIrcSessions[sessionKey];
  if (!session || !session.socket) {
    return { success: false, error: "No active IRC connection. Please connect first." };
  }

  try {
    session.socket.write(`PRIVMSG ${channel} :${params.text}\r\n`);
    session.messages.push({
      id: `irc_sent_${Date.now()}`,
      sender: "operator",
      senderNick: session.nick,
      text: params.text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      channel,
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
