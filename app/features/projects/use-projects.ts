import { useToast } from '@/components/ui/use-toast';
import { projectsAPI } from '@/lib/api';
import { type Project } from '@/lib/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useProjectQuery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching all projects
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const data = await projectsAPI.getAll();
        return data || []; // Always return an array, never undefined
      } catch (error) {
        console.error("Error fetching projects:", error);
        return []; // Return empty array on error
      }
    },
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle error with useEffect to prevent render-time state updates
  useEffect(() => {
    if (projectsQuery.error) {
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again later.",
        variant: "destructive"
      });
    }
  }, [projectsQuery.error, toast]);

  // Mutation for creating a new project
  const createProjectMutation = useMutation({
    mutationFn: (newProject: Partial<Project>) => projectsAPI.create(newProject),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project created successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for updating a project
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Project> }) =>
      projectsAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project updated successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for deleting a project
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectsAPI.delete(id),
    onSuccess: () => {
      // Invalidate both standard project queries and infinite project queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteProjects'] });

      toast({
        title: "Success",
        description: "Project deleted successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Specialized function for toggling star status
  const toggleStarMutation = useMutation({
    mutationFn: ({ id, starred }: { id: string, starred: boolean }) =>
      projectsAPI.update(id, { starred }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Toggle template status
  const toggleTemplateMutation = useMutation({
    mutationFn: ({ id, isTemplate }: { id: string, isTemplate: boolean }) =>
      projectsAPI.toggleTemplate(id, isTemplate),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Success",
        description: data.isTemplate
          ? "Project converted to template successfully!"
          : "Template converted to project successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update template status. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Clone project
  const cloneProjectMutation = useMutation({
    mutationFn: ({ id, ownerId }: { id: string, ownerId: string }) =>
      projectsAPI.clone(id, ownerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project cloned successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clone project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Batch delete for multiple projects
  const deleteMultipleProjectsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Using allSettled to allow some deletions to fail without failing the whole batch
      const results = await Promise.allSettled(ids.map(id => projectsAPI.delete(id)));

      // Count successful and failed deletions
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // If all failed, throw an error
      if (successful === 0 && failed > 0) {
        throw new Error('Failed to delete any projects');
      }

      // Return summary
      return { successful, failed, total: ids.length };
    },
    onSuccess: (result) => {
      // Invalidate both standard project queries and infinite project queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['infiniteProjects'] });

      // Show appropriate message based on partial or complete success
      if (result.failed > 0) {
        toast({
          title: "Partial Success",
          description: `${result.successful} projects deleted. ${result.failed} operations failed.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Success",
          description: `${result.successful} ${result.successful === 1 ? 'project' : 'projects'} deleted successfully!`,
          variant: "default"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete projects. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    toggleStar: toggleStarMutation.mutateAsync,
    toggleTemplate: toggleTemplateMutation.mutateAsync,
    cloneProject: cloneProjectMutation.mutateAsync,
    deleteMultipleProjects: deleteMultipleProjectsMutation.mutateAsync,
  };
}

// For backward compatibility
export function useDesignQuery() {
  return useProjectQuery();
}

// New hook for template operations
export function useTemplatesQuery(category?: string, type?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching all templates
  const templatesQuery = useQuery({
    queryKey: ['templates', { category, type }],
    queryFn: async () => {
      try {
        const data = await projectsAPI.getTemplates(category, type);
        return data || []; // Always return an array, never undefined
      } catch (error) {
        console.error("Error fetching templates:", error);
        return []; // Return empty array on error
      }
    },
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle error with useEffect to prevent render-time state updates
  useEffect(() => {
    if (templatesQuery.error) {
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again later.",
        variant: "destructive"
      });
    }
  }, [templatesQuery.error, toast]);

  // Use a template to create a new project
  const useTemplateMutation = useMutation({
    mutationFn: ({ templateId, ownerId }: { templateId: string, ownerId: string }) =>
      projectsAPI.clone(templateId, ownerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "New project created from template!",
        variant: "default"
      });
      return data; // Return the created project for further use
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project from template. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    isError: templatesQuery.isError,
    useTemplate: useTemplateMutation.mutate,
    useTemplateMutation, // Expose the full mutation object for access to more properties
  };
}

export function useProjectPresets() {
  const presetsQuery = useQuery({
    queryKey: ['projects', 'presets'],
    queryFn: () => projectsAPI.getPresets(),
    gcTime: 10 * 60 * 1000, // 10 minutes - presets change less frequently
  });
  
  return {
    presets: presetsQuery.data || [],
    isLoading: presetsQuery.isLoading,
    isError: presetsQuery.isError,
  };
}