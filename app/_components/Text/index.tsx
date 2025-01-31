interface TextProps {
  children?: React.ReactNode;
}

const Text = ({ children }: TextProps) => {
  return <div className="text-lg leading-7">{children}</div>;
};

export default Text;
