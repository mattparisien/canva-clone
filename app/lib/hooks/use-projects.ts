import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Project, projectsAPI } from '@lib/api';
import { useToast } from '@components/atoms/use-toast';

export function useProjectQuery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
  
  const createProjectMutation = useMutation({
    mutationFn: (newProject: Partial<Project>) => projectsAPI.create(newProject),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project created successfully!",
        variant: "default"
      });
    }
  });
  
  // Additional mutations for update, delete, etc.
  
  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    createProject: createProjectMutation.mutate,
  };
}

// For backward compatibility
export function useDesignQuery() {
  return useProjectQuery();
}