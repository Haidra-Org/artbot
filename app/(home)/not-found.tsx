/* eslint-disable @next/next/no-img-element */
import PageTitle from '../_components/PageTitle';
import { appBasepath } from '../_utils/browserUtils';

export default function NotFoundPage() {
  return (
    <div className="col gap-x-20">
      <PageTitle>404 Error | Nothing to see here</PageTitle>
      <div className="max-w-[1000px]">
        <img
          src={`${appBasepath()}/not-found.png`}
          alt="painting of a confused robot"
          style={{
            borderRadius: '8px',
            boxShadow: `0 16px 38px -12px rgba(0, 0, 0, 0.56), 0 4px 25px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)`,
            marginBottom: '16px',
            width: '100%'
          }}
        />
      </div>
      <div>Oh, no! This is unfortunate. It appears there is nothing here.</div>
    </div>
  );
}
