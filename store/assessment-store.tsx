"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import type { AssessmentInput, AssessmentResult } from "@/lib/chli-model";
import { DEFAULT_ASSESSMENT } from "@/lib/questionnaire-data";

interface AssessmentContextType {
  data: AssessmentInput;
  result: AssessmentResult | null;
  setValue: (path: string, value: number | null) => void;
  setBulk: (updates: Record<string, number>) => void;
  reset: () => void;
  setResult: (r: AssessmentResult) => void;
}

const AssessmentContext = createContext<AssessmentContextType | null>(null);

/** 根据路径设置嵌套值，如 "bio.actualAge" */
export function setNestedPath(
  obj: Record<string, unknown>,
  path: string,
  value: number | null
): Record<string, unknown> {
  const keys = path.split(".");
  const clone = structuredClone(obj) as Record<string, unknown>;
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return clone;
}

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AssessmentInput>(
    structuredClone(DEFAULT_ASSESSMENT) as unknown as AssessmentInput
  );
  const [result, setResultState] = useState<AssessmentResult | null>(null);

  const setValue = useCallback((path: string, value: number | null) => {
    setData((prev) =>
      setNestedPath(
        prev as unknown as Record<string, unknown>,
        path,
        value
      ) as unknown as AssessmentInput
    );
  }, []);

  const setBulk = useCallback((updates: Record<string, number>) => {
    setData((prev) => {
      let next = prev as unknown as Record<string, unknown>;
      for (const [path, value] of Object.entries(updates)) {
        next = setNestedPath(next, path, value);
      }
      return next as unknown as AssessmentInput;
    });
  }, []);

  const reset = useCallback(() => {
    setData(structuredClone(DEFAULT_ASSESSMENT) as unknown as AssessmentInput);
    setResultState(null);
  }, []);

  const setResult = useCallback((r: AssessmentResult) => {
    setResultState(r);
  }, []);

  return (
    <AssessmentContext.Provider
      value={{ data, result, setValue, setBulk, reset, setResult }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment 必须在 AssessmentProvider 内使用");
  return ctx;
}
