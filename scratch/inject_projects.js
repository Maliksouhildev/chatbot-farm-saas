const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Inject projects state and storage interceptor
const stateInjection = `  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('default');
  const activeProjectIdRef = useRef(activeProjectId);

  const getStorageKey = (key: string) => {
    // Keep user session and global prefs global
    if (key === 'cf_user_session' || key === 'cf_theme_mode') return key;
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
    
    // Switch to new project
    handleSelectProject(id);
  };

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    activeProjectIdRef.current = projectId;
    
    // Refresh all context
    const loadState = (key: string, setter: any, defaultVal: any) => {
      const stored = localStorage.getItem(getStorageKey(key));
      if (stored) {
        try {
          setter(JSON.parse(stored));
        } catch {
          setter(defaultVal);
        }
      } else {
        setter(defaultVal);
      }
    };
    
    loadState('cf_pinned_apps', setPinnedApps, ['whatsapp', 'telegram', 'gmail']);
    
    // Connected apps
    const storedApps = localStorage.getItem(getStorageKey('cf_connected_apps'));
    if (storedApps) {
      try {
        setConnectedApps(new Set(JSON.parse(storedApps)));
      } catch {
        setConnectedApps(new Set());
      }
    } else {
      setConnectedApps(new Set());
    }
  };

  // Re-run the hydration logic on project switch (partial hack for now)
  // ...`;

const targetAnchor = `  const [isClientMounted, setIsClientMounted] = useState(false);`;
code = code.replace(targetAnchor, stateInjection + '\n' + targetAnchor);

// 2. Replace localStorage calls
// We want to replace localStorage.getItem('cf_...') with localStorage.getItem(getStorageKey('cf_...'))
// EXCEPT inside handleCreateProject and handleSelectProject which we just injected!
// To avoid replacing the ones we just injected, we'll replace the existing ones BEFORE injecting the new ones, or use a complex regex.

// Let's do it right. I will re-read the file, do the regex, THEN inject the new code.
