import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { brandsAPI } from '@/lib/api';
import { Brand, CreateBrandRequest, GenerateBrandFromAssetsRequest } from '@/lib/types/brands';
import { useToast } from '@/components/ui/use-toast';

export function useBrands() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all brands
  const {
    data: brands,
    isLoading: isBrandsLoading,
    error: brandsError,
    refetch: refetchBrands,
  } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      try {
        return await brandsAPI.getAll();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch brands';
        throw new Error(errorMessage);
      }
    },
  });

  // Get a brand by ID
  const getBrandById = async (brandId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const brand = await brandsAPI.getById(brandId);
      return brand;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch brand';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (brandData: CreateBrandRequest) => {
      return await brandsAPI.create(brandData);
    },
    onSuccess: () => {
      toast({
        title: 'Brand created',
        description: 'Your brand has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create brand';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setError(errorMessage);
    },
  });

  // Update a brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: async ({
      brandId,
      brandData,
    }: {
      brandId: string;
      brandData: Partial<CreateBrandRequest>;
    }) => {
      return await brandsAPI.update(brandId, brandData);
    },
    onSuccess: () => {
      toast({
        title: 'Brand updated',
        description: 'Your brand has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update brand';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setError(errorMessage);
    },
  });

  // Delete a brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: async (brandId: string) => {
      return await brandsAPI.delete(brandId);
    },
    onSuccess: () => {
      toast({
        title: 'Brand deleted',
        description: 'Your brand has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete brand';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setError(errorMessage);
    },
  });

  // Generate a brand from assets mutation
  const generateBrandMutation = useMutation({
    mutationFn: async (request: GenerateBrandFromAssetsRequest) => {
      return await brandsAPI.generateFromAssets(request);
    },
    onSuccess: () => {
      toast({
        title: 'Brand generated',
        description: 'Your brand has been generated successfully from assets.',
      });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate brand';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setError(errorMessage);
    },
  });

  // Upload documents and generate a brand
  const uploadDocumentsAndGenerateBrand = async (files: File[], brandName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const brand = await brandsAPI.uploadDocumentsAndGenerate(files, brandName);
      console.log(brand);
      toast({
        title: 'Brand created',
        description: 'Your brand has been successfully created from the uploaded documents.',
      });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      return brand;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create brand from documents';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Share a brand mutation
  const shareBrandMutation = useMutation({
    mutationFn: async ({ brandId, userEmails }: { brandId: string; userEmails: string[] }) => {
      return await brandsAPI.share(brandId, userEmails);
    },
    onSuccess: () => {
      toast({
        title: 'Brand shared',
        description: 'Your brand has been shared successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share brand';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setError(errorMessage);
    },
  });

  return {
    // Data and states
    brands,
    isLoading: isLoading || isBrandsLoading,
    error: error || (brandsError instanceof Error ? brandsError.message : null),

    // Direct API calls
    getBrandById,
    uploadDocumentsAndGenerateBrand,

    // Mutations
    createBrand: createBrandMutation.mutate,
    updateBrand: updateBrandMutation.mutate,
    deleteBrand: deleteBrandMutation.mutate,
    generateBrandFromAssets: generateBrandMutation.mutate,
    shareBrand: shareBrandMutation.mutate,

    // Refetch function
    refetchBrands,
  };
}