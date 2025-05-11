import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Project, projectsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export function useProjectQuery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Query for fetching all projects
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll(),
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle error outside of the query options
  if (projectsQuery.error) {
    toast({
      title: "Error",
      description: "Failed to load projects. Please try again later.",
      variant: "destructive"
    });
  }
  
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
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
  
  // Batch delete for multiple projects
  const deleteMultipleProjectsMutation = useMutation({
    mutationFn: (ids: string[]) => 
      Promise.all(ids.map(id => projectsAPI.delete(id))),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: `${variables.length} ${variables.length === 1 ? 'project' : 'projects'} deleted successfully!`,
        variant: "default"
      });
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
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    toggleStar: toggleStarMutation.mutate,
    deleteMultipleProjects: deleteMultipleProjectsMutation.mutate,
  };
}

// For backward compatibility
export function useDesignQuery() {
  return useProjectQuery();
}