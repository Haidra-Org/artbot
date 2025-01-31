import clsx from 'clsx';
import { useCallback, useRef, useEffect, useState } from 'react';
import ReactTextareaAutosize from 'react-textarea-autosize';
import dJSON from 'dirty-json';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidate: (isValid: boolean, error: string | null) => void;
  error: string | null;
  onBlur?: (value: string) => string;
}

const JsonInput: React.FC<JsonInputProps> = ({
  value,
  onChange,
  onValidate,
  error,
  onBlur
}) => {
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const formatJson = useCallback((json: string): string => {
    try {
      return JSON.stringify(dJSON.parse(json), null, 2);
    } catch {
      return json;
    }
  }, []);

  const validateJson = useCallback(
    (json: string): void => {
      try {
        JSON.parse(json);
        onValidate(true, null);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Invalid JSON';
        onValidate(false, errorMessage);
      }
    },
    [onValidate]
  );

  const handleBlur = useCallback(() => {
    let formattedJson = formatJson(value);
    if (onBlur) {
      formattedJson = onBlur(formattedJson);
    }
    onChange(formattedJson);
    validateJson(formattedJson);
  }, [value, formatJson, validateJson, onChange, onBlur]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  useEffect(() => {
    const updateLineNumbers = () => {
      if (textareaRef.current) {
        const lineHeight = parseInt(
          window.getComputedStyle(textareaRef.current).lineHeight
        );
        const visibleLines = Math.floor(
          textareaRef.current.clientHeight / lineHeight
        );
        const totalLines = value.split('\n').length;
        const numbers = Array.from(
          { length: Math.min(visibleLines, totalLines) },
          (_, i) => `${i + 1}`
        );
        setLineNumbers(numbers);
      }
    };
    updateLineNumbers();
    window.addEventListener('resize', updateLineNumbers);
    return () => window.removeEventListener('resize', updateLineNumbers);
  }, [value]);

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const errorLineNumber = error?.match(/line (\d+)/)?.[1] ?? null;

  return (
    <div className="col">
      <div className="relative flex">
        <div
          ref={lineNumbersRef}
          className="w-10 bg-gray-100 text-gray-500 text-right pt-2 pr-1 font-mono text-[16px] border-r border-gray-300 overflow-hidden"
          style={{ height: textareaRef.current?.clientHeight }}
        >
          {lineNumbers.map((num, index) => (
            <div
              className="pr-1"
              key={index}
              style={{
                backgroundColor:
                  num === errorLineNumber ? '#FFB6A6' : undefined,
                color: num === errorLineNumber ? 'red' : undefined,
                fontWeight: num === errorLineNumber ? 'bold' : 300
              }}
            >
              {num}
            </div>
          ))}
        </div>
        <ReactTextareaAutosize
          ref={textareaRef}
          className={clsx(
            'bg-gray-50 border border-gray-300 text-gray-900 font-mono text-[16px] rounded-r-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2',
            error && 'border-red-500'
          )}
          placeholder="Edit JSON"
          minRows={37}
          onBlur={handleBlur}
          onChange={handleChange}
          onScroll={syncScroll}
          value={value}
          spellCheck={false}
          style={{
            border: error ? '2px solid red' : undefined,
            resize: 'none'
          }}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm font-mono font-bold mt-0 ">
          {error}
        </div>
      )}
    </div>
  );
};

export default JsonInput;
