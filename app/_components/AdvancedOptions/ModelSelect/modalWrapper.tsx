import { ModelStore } from '@/app/_stores/ModelStore';
import ModelsInfo from '@/app/(content)/info/models/_component/ModelsInfo';
import React, { useEffect, useRef } from 'react';
import { useStore } from 'statery';

interface Props {
  handleSelectModel: (model: string) => void;
}

const ModelModalWrapper = ({ handleSelectModel }: Props) => {
  const { availableModels, modelDetails } = useStore(ModelStore);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  }, []);

  return (
    <div ref={modalRef}>
      <div className="col pt-4">
        <h2 className="row font-bold">Image models</h2>
        <ModelsInfo
          isModal
          modelsAvailable={availableModels}
          modelDetails={modelDetails}
          onUseModel={handleSelectModel}
        />
      </div>
    </div>
  );
};

export default ModelModalWrapper;
