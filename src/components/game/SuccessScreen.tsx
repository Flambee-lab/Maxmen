import Image from "next/image";
import { PhotoCard, NameChip } from "@/types/game";

interface SuccessScreenProps {
  connections: Array<{ nameId: string; cardId: string }>;
  cards: PhotoCard[];
  chips: NameChip[];
  /** Título de la pantalla; por defecto victoria. Si es timeout usar "Endgame – Time's Up" */
  title?: string;
}

export function SuccessScreen({
  connections,
  cards,
  chips,
  title = "¡Respuestas Correctas!",
}: SuccessScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="radial-bg"></div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-white mb-8">
            {title}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
            {chips.map((chip) => {
              const connection = connections.find((c) => c.nameId === chip.id);
              const cardId = connection?.cardId;
              const card = cards.find((c) => c.id === cardId);
              return (
                <div
                  key={chip.id}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="rounded-2xl overflow-hidden border-2 border-green-400 w-32 h-48 relative">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {card?.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-white font-medium">{chip.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
