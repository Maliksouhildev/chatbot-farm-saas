const fs = require('fs');
let code = fs.readFileSync('lib/mock_chats.ts', 'utf8');

// I will just replace the entire PAIRED_CHATS_BY_APP with a version that includes Discord and Telegram mocks
const mockData = `export const PAIRED_CHATS_BY_APP: Record<string, ContactProfile[]> = {
  whatsapp: [],
  whatsapp_2: [],
  instagram: [],
  telegram: [
    {
      id: "tg_group_1",
      appId: "telegram",
      name: "Bot Farm Admins",
      handleOrPhone: "@botfarm_admins",
      avatarText: "BF",
      avatarColor: "bg-blue-500",
      statusText: "Admin Group",
      lastMessage: "System update tonight.",
      time: "10:00 AM",
      isGroup: true,
      messages: [],
      children: [
        {
          id: "tg_topic_1",
          appId: "telegram",
          name: "General",
          handleOrPhone: "#general",
          statusText: "Topic",
          lastMessage: "System update tonight.",
          time: "10:00 AM",
          isGroup: false,
          messages: [{ id: "m1", sender: "ai", text: "System update tonight.", time: "10:00 AM", seen: true }]
        },
        {
          id: "tg_topic_2",
          appId: "telegram",
          name: "Alerts",
          handleOrPhone: "#alerts",
          statusText: "Topic",
          lastMessage: "Node is down.",
          time: "09:00 AM",
          isGroup: false,
          messages: [{ id: "m2", sender: "ai", text: "Node is down.", time: "09:00 AM", seen: true }]
        }
      ]
    },
    {
      id: "tg_user_1",
      appId: "telegram",
      name: "John Doe",
      handleOrPhone: "@johndoe",
      avatarText: "JD",
      avatarColor: "bg-green-500",
      statusText: "Online",
      lastMessage: "Hey, is the bot working?",
      time: "11:00 AM",
      isGroup: false,
      messages: [{ id: "m3", sender: "customer", text: "Hey, is the bot working?", time: "11:00 AM", seen: true }]
    }
  ],
  signal: [],
  x_twitter: [],
  google_messages: [],
  google_chat: [],
  google_voice: [],
  discord: [
    {
      id: "dc_server_1",
      appId: "discord",
      name: "Support Server",
      handleOrPhone: "Server",
      avatarText: "SS",
      avatarColor: "bg-indigo-500",
      statusText: "Support Hub",
      lastMessage: "Check the tickets",
      time: "12:00 PM",
      isGroup: true,
      messages: [],
      children: [
        {
          id: "dc_cat_1",
          appId: "discord",
          name: "Tickets",
          handleOrPhone: "Category",
          statusText: "Category",
          lastMessage: "",
          isGroup: true,
          messages: [],
          children: [
            {
              id: "dc_chan_1",
              appId: "discord",
              name: "ticket-001",
              handleOrPhone: "#ticket-001",
              statusText: "Text Channel",
              lastMessage: "I need help with my account.",
              time: "12:00 PM",
              isGroup: false,
              messages: [{ id: "m4", sender: "customer", text: "I need help with my account.", time: "12:00 PM", seen: true }]
            }
          ]
        },
        {
          id: "dc_chan_2",
          appId: "discord",
          name: "general",
          handleOrPhone: "#general",
          statusText: "Text Channel",
          lastMessage: "Hello everyone!",
          time: "11:00 AM",
          isGroup: false,
          messages: [{ id: "m5", sender: "customer", text: "Hello everyone!", time: "11:00 AM", seen: true }]
        }
      ]
    }
  ],
  slack: [],
  linkedin: [],
  irc: [],
  matrix: [],
};`;

const searchStart = "export const PAIRED_CHATS_BY_APP: Record<string, ContactProfile[]> = {";
const idx1 = code.indexOf(searchStart);
const idx2 = code.indexOf("};", idx1);
code = code.substring(0, idx1) + mockData + code.substring(idx2 + 2);
fs.writeFileSync('lib/mock_chats.ts', code);
console.log('Done!');
