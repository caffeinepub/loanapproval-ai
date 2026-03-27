import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  LoanApplication,
  PredictionRecord,
  PredictionResult,
} from "../backend";
import { useActor } from "./useActor";

export function usePredictionHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<PredictionRecord[]>({
    queryKey: ["predictionHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPredictionHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<PredictionResult, Error, LoanApplication>({
    mutationFn: async (application: LoanApplication) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitApplication(application);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictionHistory"] });
    },
  });
}
