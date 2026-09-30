const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Replace all localStorage calls that use string literals starting with 'cf_'
code = code.replace(/localStorage\.getItem\('cf_([^']+)'\)/g, "localStorage.getItem(getStorageKey('cf_$1'))");
code = code.replace(/localStorage\.setItem\('cf_([^']+)',/g, "localStorage.setItem(getStorageKey('cf_$1'),");

// Oh wait, there are dynamic ones:
code = code.replace(/localStorage\.setItem\(`cf_connected_apps_\$\{currentUser\.id\}`/g, "localStorage.setItem(getStorageKey(`cf_connected_apps_${currentUser.id}`)");

// 2. Inject projects state and storage interceptor
const stateInjection = `  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('default');
  const activeProjectIdRef = useRef(activeProjectId);

  const getStorageKey = (key: string) => {
    if (key === 'cf_user_session' || key === 'cf_theme_mode' || key === 'cf_projects') return key;
    return activeProjectIdRef.current === 'default' ? key : key + '_' + activeProjectIdRef.current;
  };

  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('cf_projects');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      } else {
        const defaultProjects = [{ id: 'default', name: 'Main Workspace', role: 'owner' }];
        setProjects(defaultProjects);
        localStorage.setItem('cf_projects', JSON.stringify(defaultProjects));
      }
    } catch {}
  }, []);

  const handleCreateProject = () => {
    const id = 'proj_' + Date.now();
    const newProj = { id, name: 'Burner Project ' + (projects.length), role: 'admin' };
    const nextProjects = [...projects, newProj];
    setProjects(nextProjects);
    localStorage.setItem('cf_projects', JSON.stringify(nextProjects));
    
    // Inherit main account emails
    const inheritEmail = (key: string) => {
      const val = localStorage.getItem(key);
      if (val) localStorage.setItem(key + '_' + id, val);
    };
    inheritEmail('cf_gmail_account');
    inheritEmail('cf_google_chat_account');
    
    // Also copy connected apps so it shows up as connected
    const mainApps = localStorage.getItem('cf_connected_apps');
    if (mainApps) {
      try {
        const parsed = JSON.parse(mainApps);
        const inheritedApps = parsed.filter((app: string) => ['gmail', 'google_chat'].includes(app));
        localStorage.setItem('cf_connected_apps_' + id, JSON.stringify(inheritedApps));
      } catch {}
    }
    
    handleSelectProject(id);
  };

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    activeProjectIdRef.current = projectId;
    
    const loadState = (key: string, setter: any, defaultVal: any) => {
      const stored = localStorage.getItem(getStorageKey(key));
      if (stored) {
        try { setter(JSON.parse(stored)); } catch { setter(defaultVal); }
      } else {
        setter(defaultVal);
      }
    };
    
    loadState('cf_pinned_apps', setPinnedApps, ['whatsapp', 'telegram', 'gmail']);
    
    const storedApps = localStorage.getItem(getStorageKey('cf_connected_apps'));
    if (storedApps) {
      try { setConnectedApps(new Set(JSON.parse(storedApps))); } catch { setConnectedApps(new Set()); }
    } else {
      setConnectedApps(new Set());
    }
    
    const storedLayout = localStorage.getItem(getStorageKey('cf_panel_sizes'));
    if (storedLayout && groupRef.current) {
      try { groupRef.current.setLayout(JSON.parse(storedLayout)); } catch {}
    }
  };
`;

const targetAnchor = `  const [isClientMounted, setIsClientMounted] = useState(false);`;
code = code.replace(targetAnchor, stateInjection + '\n  ' + targetAnchor);

// 3. Inject Navbar props
code = code.replace(/<Navbar([\s\S]*?)onOpenTeamModal=\{\(\) => setIsTeamModalOpen\(true\)\}/, 
`<Navbar$1onOpenTeamModal={() => setIsTeamModalOpen(true)}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}`);

fs.writeFileSync('app/page.tsx', code);
console.log('Fixed page.tsx');
