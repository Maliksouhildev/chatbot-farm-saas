const fs = require('fs');
let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

const targetGmail = `          </div>
  
          {/* TOP HALF: Received Email Message */}`;
const replacementGmail = `          </div>
  
          {channelError && (
            <div className="absolute inset-x-0 top-14 z-40 bg-red-500/95 text-white p-3 text-[11px] font-bold flex items-center gap-2.5 shadow-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="flex-1 leading-tight">{channelError}</p>
            </div>
          )}

          {/* TOP HALF: Received Email Message */}`;

code = code.replace(targetGmail, replacementGmail);

const targetWhatsapp = `        </div>
  
        {/* Chat Feed */}`;
const replacementWhatsapp = `        </div>
  
        {channelError && (
          <div className="absolute inset-x-0 top-14 z-40 bg-red-500/95 text-white p-3 text-[11px] font-bold flex items-center gap-2.5 shadow-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="flex-1 leading-tight">{channelError}</p>
          </div>
        )}

        {/* Chat Feed */}`;

code = code.replace(targetWhatsapp, replacementWhatsapp);

fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);
console.log("Done");
