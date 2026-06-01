"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalProjectOwner = getPersonalProjectOwner;
exports.getProjectDisplayLabel = getProjectDisplayLabel;
exports.getCanonicalProjectName = getCanonicalProjectName;
exports.getProjectDetail = getProjectDetail;
function getPersonalProjectOwner(project) {
    if (project.type !== 'personal') {
        return undefined;
    }
    const name = project.name?.trim();
    if (!name || name.toLowerCase() === 'personal') {
        return undefined;
    }
    return name;
}
function getProjectDisplayLabel(project) {
    if (project.type !== 'personal') {
        return getCanonicalProjectName(project);
    }
    const owner = getPersonalProjectOwner(project);
    return owner ? `Personal - ${owner}` : 'Personal';
}
function getCanonicalProjectName(project) {
    if (project.type === 'personal') {
        return 'Personal';
    }
    return project.name?.trim() || project.id || 'Unnamed project';
}
function getProjectDetail(project) {
    const parts = [];
    if (project.type) {
        parts.push(`Type: ${project.type}`);
    }
    const owner = getPersonalProjectOwner(project);
    if (owner) {
        parts.push(`Owner: ${owner}`);
    }
    if (project.id) {
        parts.push(`ID: ${project.id}`);
    }
    return parts.join(' | ');
}
//# sourceMappingURL=project-display.js.map