import React from "react";
import { useNavigate } from "react-router-dom";

const DocumentationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            ← Zurück
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Dokumentation</h1>
          <div></div> {/* Spacer for centering */}
        </div>

        {/* Documentation content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Anleitung: Kampfmodus
            </h1>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">
              Vorbereitung
            </h2>
            <ol className="list-decimal list-inside mb-6">
              <li>
                <strong>Pokémon auswählen</strong>: Bevor der Kampf beginnt,
                wählt jeder Trainer seine Pokémon aus, die am Kampf teilnehmen
                sollen.
              </li>
            </ol>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">
              Ablauf des Kampfes
            </h2>

            <h3 className="text-lg font-medium text-gray-700 mb-3 mt-6">
              1. Reihenfolge bestimmen
            </h3>
            <ul className="list-disc list-inside mb-4">
              <li>
                Die Reihenfolge, wer zuerst handelt, wird durch den{" "}
                <strong>Kampf-Skill</strong> der Trainer ausgewürfelt.
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-700 mb-3 mt-6">
              2. Aktionen des Angreifers
            </h3>
            <p className="mb-2">
              Wenn ein Trainer an der Reihe ist, hat er folgende Optionen:
            </p>
            <ol className="list-decimal list-inside mb-4 ml-4">
              <li>
                <strong>Pokémon wechseln</strong>: Der Trainer kann ein anderes
                Pokémon in den Kampf schicken.
              </li>
              <li>
                <strong>Item einsetzen</strong>: Der Trainer kann ein Item
                verwenden, um z. B. sein Pokémon zu heilen oder zu stärken.
              </li>
              <li>
                <strong>Attacke einsetzen</strong>: Der Trainer kann eine
                Attacke seines Pokémon auswählen und ein Ziel benennen.
              </li>
            </ol>

            <h3 className="text-lg font-medium text-gray-700 mb-3 mt-6">
              3. Reaktion des Verteidigers
            </h3>
            <p className="mb-2">
              Der Verteidiger entscheidet, wie er auf die Attacke reagiert:
            </p>
            <ul className="list-disc list-inside mb-4 ml-4">
              <li>
                <strong>Verteidigen</strong>: Das Pokémon des Verteidigers nimmt
                die Attacke an und versucht, den Schaden zu minimieren.
              </li>
              <li>
                <strong>Ausweichen</strong>: Der Verteidiger versucht, der
                Attacke auszuweichen.
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-700 mb-3 mt-6">
              4. Angriffswurf
            </h3>
            <p className="mb-2">
              Der Angreifer trifft immer zunächst automatisch. Der Verteidiger
              würfelt, um die Auswirkungen der Attacke zu bestimmen:
            </p>
            <ul className="list-disc list-inside mb-4 ml-4">
              <li>
                <strong>Verteidigen</strong>:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>
                    Wenn das Würfelergebnis des Verteidigers kleiner ist als der
                    Angriffswurf, wird die Hälfte des Verteidigungswerts vom
                    Schaden abgezogen.
                  </li>
                  <li>
                    Bei einem erfolgreichen Verteidigungswurf wird der gesamte
                    Verteidigungswert abgezogen.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Ausweichen</strong>:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>
                    Wenn der Verteidiger erfolgreich ausweicht (basierend auf
                    dem Geschwindigkeits-Stat), wird kein Schaden berechnet.
                  </li>
                  <li>
                    Bei einem Fehlschlag wird der volle Schaden berechnet.
                  </li>
                </ul>
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-700 mb-3 mt-6">
              5. Schadensberechnung
            </h3>
            <ul className="list-disc list-inside mb-4">
              <li>
                Der Verteidiger führt die Schadensberechnung durch und wendet
                den Schaden auf sein Pokémon an.
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">
              Wiederholung
            </h2>
            <ul className="list-disc list-inside mb-4">
              <li>
                Der Ablauf wiederholt sich, bis ein Trainer keine kampffähigen
                Pokémon mehr hat.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
