export default function GameInfo() {
    return (
      <div className="game-info-container bg-gray-900 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Game Rules</h2>
  
        <p className="mb-4">
          Welcome to the <strong>Cronos Treasure Hunt</strong>! 🏆  
          - <strong>Buy Tickets</strong>: Purchase tickets to join the game.  
          - <strong>Select a Chest</strong>: Choose one of the mysterious chests.  
          - <strong>Win Prizes</strong>: Open your chest and claim your reward! 🎉  
        </p>
  
        <div className="border border-gray-700 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2">🏆 Prize Table 🏆</h3>
          <ul className="list-none">
            <li className="flex justify-between"><span>💎 <strong>Cronos Trillionaire</strong></span> <span>5000 CRO</span></li>
            <li className="flex justify-between"><span>💰 <strong>Cronos Billionaire</strong></span> <span>2500 CRO</span></li>
            <li className="flex justify-between"><span>💵 <strong>Cronos Millionaire</strong></span> <span>1000 CRO</span></li>
            <li className="flex justify-between"><span>🚀 <strong>Bull Run</strong></span> <span>500 CRO</span></li>
            <li className="flex justify-between"><span>🔥 <strong>We are so FuCkiNg BACK!</strong></span> <span>250 CRO</span></li>
            <li className="flex justify-between"><span>⚡ <strong>We are back!</strong></span> <span>100 CRO</span></li>
            <li className="flex justify-between"><span>🟢 <strong>Good Exit</strong></span> <span>75 CRO</span></li>
            <li className="flex justify-between"><span>🔵 <strong>No lose, Good news</strong></span> <span>50 CRO</span></li>
            <li className="flex justify-between"><span>🐻 <strong>Bear</strong></span> <span>20 CRO</span></li>
            <li className="flex justify-between text-red-500 font-bold"><span>💀 <strong>Rug Pulled to 0</strong></span> <span>0 CRO</span></li>
          </ul>
        </div>
      </div>
    );
  }
  