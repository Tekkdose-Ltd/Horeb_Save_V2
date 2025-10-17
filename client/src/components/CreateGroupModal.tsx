import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Name too long"),
  description: z.string().optional(),
  maxMembers: z.number().min(2, "Minimum 2 members").max(20, "Maximum 20 members"),
  contributionAmount: z.number().min(1, "Contribution amount is required"),
  frequency: z.enum(["weekly", "bi-weekly", "monthly"]),
  isPublic: z.boolean().default(false),
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      maxMembers: 6,
      contributionAmount: 500,
      frequency: "monthly",
      isPublic: false,
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupFormData) => {
      const response = await apiRequest("POST", "/api/groups", {
        ...data,
        contributionAmount: data.contributionAmount.toString(),
        totalRounds: data.maxMembers,
      });
      return response.json();
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      
      toast({
        title: "Group Created",
        description: `${group.name} has been created successfully!`,
      });
      
      form.reset();
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateGroupFormData) => {
    createGroupMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full" data-testid="modal-create-group">
        <DialogHeader>
          <DialogTitle data-testid="title-create-group">Create New Group</DialogTitle>
          <DialogDescription>
            Set up a new savings group with customizable parameters.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Emergency Fund Circle" 
                      {...field}
                      data-testid="input-group-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What are you saving for?"
                      className="h-20"
                      {...field}
                      data-testid="input-group-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxMembers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Size</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-group-size">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2">2 members</SelectItem>
                        <SelectItem value="4">4 members</SelectItem>
                        <SelectItem value="6">6 members</SelectItem>
                        <SelectItem value="8">8 members</SelectItem>
                        <SelectItem value="10">10 members</SelectItem>
                        <SelectItem value="12">12 members</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contributionAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Amount (£)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="500"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-contribution-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-frequency">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Group</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Allow others to discover and join this group
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-public-group"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={handleClose}
                data-testid="button-cancel-create-group"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createGroupMutation.isPending}
                data-testid="button-submit-create-group"
              >
                {createGroupMutation.isPending ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
