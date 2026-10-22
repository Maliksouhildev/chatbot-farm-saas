const fs = require('fs');
const path = require('path');

function replaceAvatarsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // ChannelNativeViews.tsx
  // Discord Header
  content = content.replace(
    /\{isChannel \? "#" : activeContact\.avatarText \|\| "D"\}/g,
    `{activeContact?.profilePicUrl ? (
                <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-full" />
              ) : (
                isChannel ? "#" : activeContact.avatarText || "D"
              )}`
  );

  // Discord Feed Bubble (User)
  content = content.replace(
    /\{isMe \? "OP" : activeContact\.avatarText \|\| "U"\}/g,
    `{isMe ? "OP" : (
                      activeContact?.profilePicUrl ? (
                        <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-full" />
                      ) : (
                        activeContact.avatarText || "U"
                      )
                    )}`
  );

  // Slack Feed Bubble (User)
  content = content.replace(
    /\{isMe \? "OP" : activeContact\.avatarText \|\| "S"\}/g,
    `{isMe ? "OP" : (
                    activeContact?.profilePicUrl ? (
                      <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-md" />
                    ) : (
                      activeContact.avatarText || "S"
                    )
                  )}`
  );

  // Matrix Feed Bubble (User)
  content = content.replace(
    /\{isMe \? "OP" : activeContact\.avatarText \|\| "M"\}/g,
    `{isMe ? "OP" : (
                    activeContact?.profilePicUrl ? (
                      <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-lg" />
                    ) : (
                      activeContact.avatarText || "M"
                    )
                  )}`
  );

  // LinkedIn Top Bar Bubble
  content = content.replace(
    /\{activeContact\.avatarText \|\| "IN"\}/g,
    `{activeContact?.profilePicUrl ? (
                <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-md" />
              ) : (
                activeContact.avatarText || "IN"
              )}`
  );

  // Google Messages/Chat Top Bar Bubble
  content = content.replace(
    /\{activeContact\.avatarText \|\| "G"\}/g,
    `{activeContact?.profilePicUrl ? (
                <img src={activeContact.profilePicUrl} alt="" className="object-cover w-full h-full rounded-full" />
              ) : (
                activeContact.avatarText || "G"
              )}`
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

replaceAvatarsInFile(path.join(__dirname, 'components/workspace/ChannelNativeViews.tsx'));
