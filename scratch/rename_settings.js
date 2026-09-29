const fs = require('fs');
let code = fs.readFileSync('components/layout/Navbar.tsx', 'utf8');
code = code.replace(/Settings & BYOK Keys/g, 'Bot Settings');

// Fix dark mode text color in profile dropdown
// The user complained: "bot persona when in dark mode is all whiet which is not suposede ot be teh ase it make the userblind same thing for teh billing page ext look at this icon in teh right p[anel too its too tightened"
// And "website wheni n dark mode has some issues like u cant see at all" (referring to the black text on dark background in the dropdown menu shown in the first image).
code = code.replace(/text-\[#1B1B1B\] text-xs/g, 'text-[#1B1B1B] dark:text-gray-200 text-xs');
code = code.replace(/text-\[#1B1B1B\]/g, 'text-[#1B1B1B] dark:text-gray-200');

fs.writeFileSync('components/layout/Navbar.tsx', code);
console.log("Navbar renamed and dark mode text fixed");
