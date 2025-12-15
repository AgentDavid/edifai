interface PlaceholderProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
      <p className="text-slate-500 max-w-md mb-6">{description}</p>
      <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
        En construcción
      </div>
    </div>
  );
};

export default PlaceholderPage;
