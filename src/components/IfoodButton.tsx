import { Utensils } from "lucide-react";

export const IfoodButton = () => {
  const ifoodUrl = "https://www.ifood.com.br/delivery/aracaju-se/big-big-burguer-santa-maria/8c94e90e-f50e-456e-9ebb-f2c0990d64db?UTM_Medium=share";

  return (
    <a
      href={ifoodUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-40 right-6 z-40 group"
      aria-label="iFood"
    >
      <div className="relative animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EA1D2C] to-[#C91929] rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="relative bg-gradient-to-br from-[#EA1D2C] to-[#C91929] p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
          <Utensils className="h-6 w-6 text-white" />
        </div>
      </div>
    </a>
  );
};
