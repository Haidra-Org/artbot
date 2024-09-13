'use client';
import { useCustomQueryParams } from '@/app/_hooks/useCustomQueryParams';
import { useInput } from '@/app/_providers/PromptInputProvider';

// It doesn't render anything, it just handles the query params
export default function CustomQueryParamsHandler() {
  const { setInput } = useInput(); // Get setInput from the context
  useCustomQueryParams(setInput);
  return null;
}
