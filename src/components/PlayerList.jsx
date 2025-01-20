// Update this part in your HockeyLeagueApp.jsx

// First, modify how we get data from Firebase
useEffect(() => {
  const loadData = async () => {
    try {
      // Players listener
      const playersRef = ref(db, "players");
      const unsubPlayers = onValue(playersRef, (snapshot) => {
        const data = snapshot.val();
        const playersArray = data
          ? Object.entries(data).map(([id, player]) => ({
              ...player,
              id, // Make sure each player has an ID
            }))
          : [];
        setPlayers(playersArray);
      });

      // Waitlist listener
      const waitlistRef = ref(db, "waitlist");
      const unsubWaitlist = onValue(waitlistRef, (snapshot) => {
        const data = snapshot.val();
        const waitlistArray = data
          ? Object.entries(data).map(([id, player]) => ({
              ...player,
              id, // Make sure each waitlist player has an ID
            }))
          : [];
        setWaitlist(waitlistArray);
      });

      // ... rest of your useEffect
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  loadData();
}, [user]);

// Update the PlayerList component
const PlayerList = ({ players, onRemove, onTogglePayment, isWaitlist }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {players.map((player) => (
      <Card
        key={player.id} // Use the Firebase-generated ID
        className={`bg-white ${
          player.hasPaid ? "border-2 border-green-500" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium text-lg">{player.name}</h3>
                <p className="text-gray-600 text-sm">{player.email}</p>
              </div>
              <Button
                onClick={() => onRemove(player.id, isWaitlist)}
                className="bg-red-500 hover:bg-red-600 text-sm px-3 py-1"
              >
                Remove
              </Button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">
                Payment Status:
                <span
                  className={player.hasPaid ? "text-green-600" : "text-red-600"}
                >
                  {player.hasPaid ? " Paid" : " Unpaid"}
                </span>
              </span>
              <Button
                onClick={() => onTogglePayment(player.id, isWaitlist)}
                className={`text-sm px-3 py-1 ${
                  player.hasPaid
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {player.hasPaid ? "Mark Unpaid" : "Mark Paid"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
