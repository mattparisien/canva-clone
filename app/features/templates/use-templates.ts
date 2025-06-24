import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesAPI } from '@/lib/api';
import { Template } from '@/lib/types/api';
import { useToast } from '@/components/ui/use-toast';

interface UseTemplatesQueryProps {
  category?: string;
  type?: string;
  featured?: boolean;
  popular?: boolean;
  tags?: string[];
}

export function useTemplatesQuery(props?: UseTemplatesQueryProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Create a query key that includes all props for effective caching
  const queryKey = ['templates', props];
  
  // Query for fetching templates based on provided filters
  const templatesQuery = useQuery({
    queryKey,
    queryFn: () => templatesAPI.getAll(props),
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle error outside of the query options
  if (templatesQuery.error) {
    toast({
      title: "Error",
      description: "Failed to load templates. Please try again later.",
      variant: "destructive"
    });
  }
  
  // Mutation for creating a new template
  const createTemplateMutation = useMutation({
    mutationFn: (newTemplate: Partial<Template>) => templatesAPI.create(newTemplate),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Success",
        description: "Template created successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for updating a template
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Template> }) => 
      templatesAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Success",
        description: "Template updated successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for deleting a template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => templatesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Success",
        description: "Template deleted successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Use a template to create a project
  const useTemplateMutation = useMutation({
    mutationFn: ({ templateId, ownerId }: { templateId: string, ownerId: string }) => 
      templatesAPI.use(templateId, ownerId),
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
  
  // Create template from an existing project
  const createFromProjectMutation = useMutation({
    mutationFn: ({ 
      projectId, 
      data
    }: { 
      projectId: string, 
      data: { slug: string, categories?: string[], tags?: string[] }
    }) => templatesAPI.createFromProject(projectId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Success",
        description: "Template created successfully from project!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create template from project. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Hook for featured templates
  const useFeaturedTemplatesQuery = () => {
    return useQuery({
      queryKey: ['templates', 'featured'],
      queryFn: () => templatesAPI.getFeatured(),
      gcTime: 5 * 60 * 1000, // 5 minutes
    });
  };
  
  // Hook for popular templates
  const usePopularTemplatesQuery = () => {
    return useQuery({
      queryKey: ['templates', 'popular'],
      queryFn: () => templatesAPI.getPopular(),
      gcTime: 5 * 60 * 1000, // 5 minutes
    });
  };
  
  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    isError: templatesQuery.isError,
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    useTemplate: useTemplateMutation.mutate,
    createFromProject: createFromProjectMutation.mutate,
    useFeaturedTemplatesQuery,
    usePopularTemplatesQuery
  };
}

// Specialized hooks for specific template types
export function useFeaturedTemplates() {
  const queryClient = useQueryClient();
  
  const featuredQuery = useQuery({
    queryKey: ['templates', 'featured'],
    queryFn: () => templatesAPI.getFeatured(),
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    featuredTemplates: featuredQuery.data || [],
    isLoading: featuredQuery.isLoading,
    isError: featuredQuery.isError,
  };
}

export function usePopularTemplates() {
  const queryClient = useQueryClient();
  
  const popularQuery = useQuery({
    queryKey: ['templates', 'popular'],
    queryFn: () => templatesAPI.getPopular(),
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    popularTemplates: popularQuery.data || [],
    isLoading: popularQuery.isLoading,
    isError: popularQuery.isError,
  };
}

export function useCategoryTemplates(category: string) {
  const queryClient = useQueryClient();
  
  const categoryQuery = useQuery({
    queryKey: ['templates', 'category', category],
    queryFn: () => templatesAPI.getByCategory(category),
    enabled: !!category, // Only run if category is provided
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    categoryTemplates: categoryQuery.data || [],
    isLoading: categoryQuery.isLoading,
    isError: categoryQuery.isError,
  };
}