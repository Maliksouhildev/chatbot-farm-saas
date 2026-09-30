const fs = require('fs');
let page = fs.readFileSync('app/page.tsx', 'utf8');

// I will use regex to find RightHubColumn and fix its props
const rightHubRegex = /<RightHubColumn([\s\S]*?)\/>/g;
page = page.replace(rightHubRegex, (match, props) => {
  let newProps = props;
  newProps = newProps.replace(/selectedContactPath=\{selectedContactPath\}/g, "selectedContactId={selectedContactPath[0] || ''}");
  newProps = newProps.replace(/onNavigatePath=\{setSelectedContactPath\}/g, "");
  return `<RightHubColumn${newProps}/>`;
});

fs.writeFileSync('app/page.tsx', page);
console.log('Fixed RightHubColumn props');
