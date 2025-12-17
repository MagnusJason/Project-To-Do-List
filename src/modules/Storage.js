// Storage Module
// Handles localStorage persistence for projects and todos

import { createProjectFromJSON } from './Project';

const STORAGE_KEY = 'todoApp_projects';

const Storage = (() => {
  // Check if localStorage is available
  const isAvailable = () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Save all projects to localStorage
  const saveProjects = (projects) => {
    if (!isAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      const data = projects.map(project => project.toJSON());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save projects:', e);
      return false;
    }
  };

  // Load all projects from localStorage
  const loadProjects = () => {
    if (!isAvailable()) {
      console.warn('localStorage is not available');
      return null;
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return null; // No saved data
      }

      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return null;
      }

      // Convert JSON data back to Project objects
      return parsed.map(projectData => createProjectFromJSON(projectData));
    } catch (e) {
      console.error('Failed to load projects:', e);
      return null;
    }
  };

  // Clear all saved data
  const clearData = () => {
    if (!isAvailable()) return false;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Failed to clear data:', e);
      return false;
    }
  };

  return {
    isAvailable,
    saveProjects,
    loadProjects,
    clearData,
  };
})();

export default Storage;

