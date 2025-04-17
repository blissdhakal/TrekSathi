import { Button } from "@/components/ui/button";

export function CircularButton({ value, onClick, selected }) {
  return (
    <Button
      className={`rounded-full w-16 h-16 ${
        selected
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-300 text-black'
      }`}
      onClick={onClick}
    >
      {value}
    </Button>
  );
}