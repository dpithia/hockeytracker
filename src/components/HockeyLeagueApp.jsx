import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { ref, onValue, push, remove, update, set } from "firebase/database";
import { useAuth } from "../contexts/AuthContext";
import { signOutUser } from "../firebase/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./ui";

import { sendEmail, emailTemplates } from "../utils/emailService";

const HockeyLeagueApp = ({ isGuest }) => {
  // Update this line
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [scheduleProposals, setScheduleProposals] = useState([]);
  const [finalizedSchedule, setFinalizedSchedule] = useState(null);
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      if (isGuest) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out");
    }
  };
  // Fetch user data and set up realtime listeners
  useEffect(() => {
    const loadData = async () => {
      try {
        // User data listener
        if (user) {
          const userRef = ref(db, `users/${user.uid}`);
          const unsubUser = onValue(userRef, (snapshot) => {
            setUserData(snapshot.val());
          });
        }

        // Players listener
        const playersRef = ref(db, "players");
        const unsubPlayers = onValue(playersRef, (snapshot) => {
          const data = snapshot.val();
          setPlayers(data ? Object.values(data) : []);
        });

        // Waitlist listener
        const waitlistRef = ref(db, "waitlist");
        const unsubWaitlist = onValue(waitlistRef, (snapshot) => {
          const data = snapshot.val();
          setWaitlist(data ? Object.values(data) : []);
        });

        // Schedule proposals listener
        const proposalsRef = ref(db, "scheduleProposals");
        const unsubProposals = onValue(proposalsRef, (snapshot) => {
          const data = snapshot.val();
          setScheduleProposals(data ? Object.values(data) : []);
        });

        // Finalized schedule listener
        const finalizedRef = ref(db, "finalizedSchedule");
        const unsubFinalized = onValue(finalizedRef, (snapshot) => {
          setFinalizedSchedule(snapshot.val());
        });

        setLoading(false);

        // Cleanup function
        return () => {
          if (user) unsubUser();
          unsubPlayers();
          unsubWaitlist();
          unsubProposals();
          unsubFinalized();
        };
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleAddScheduleProposal = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newProposal = {
      date: formData.get("date"),
      time: formData.get("time"),
      votes: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await push(ref(db, "scheduleProposals"), newProposal);
      event.target.reset();
    } catch (error) {
      console.error("Error adding proposal:", error);
      alert("Error adding proposal");
    }
  };

  const handleVote = async (proposalId) => {
    try {
      const proposalRef = ref(db, `scheduleProposals/${proposalId}`);
      await update(proposalRef, {
        votes:
          (scheduleProposals.find((p) => p.id === proposalId)?.votes || 0) + 1,
      });
    } catch (error) {
      console.error("Error updating votes:", error);
      alert("Error updating votes");
    }
  };

  const finalizeSchedule = async (proposalId) => {
    try {
      const selectedProposal = scheduleProposals.find(
        (p) => p.id === proposalId
      );
      await set(ref(db, "finalizedSchedule"), selectedProposal);
      alert(
        `Schedule finalized: ${selectedProposal.date} at ${selectedProposal.time}`
      );
    } catch (error) {
      console.error("Error finalizing schedule:", error);
      alert("Error finalizing schedule");
    }
  };

  const handleAddPlayer = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newPlayer = {
      name: formData.get("name"),
      email: formData.get("email"),
      hasPaid: false,
      joinedAt: new Date().toISOString(),
    };

    try {
      if (players.length < 20) {
        const emailTemplate = emailTemplates.activeRosterJoin(newPlayer.name);
        const emailSent = await sendEmail(newPlayer.email, emailTemplate);

        await push(ref(db, "players"), newPlayer);

        if (!emailSent) {
          alert("Player added, but email failed to send");
        }
      } else {
        const emailTemplate = emailTemplates.waitlistJoin(newPlayer.name);
        const emailSent = await sendEmail(newPlayer.email, emailTemplate);

        await push(ref(db, "waitlist"), newPlayer);

        if (!emailSent) {
          alert("Player added to waitlist, but email failed to send");
        }
      }
      event.target.reset();
    } catch (error) {
      console.error("Error adding player:", error);
      alert("Error adding player");
    }
  };
  const togglePaymentStatus = async (playerId, isWaitlist) => {
    if (!playerId) {
      console.error("No player ID provided");
      return;
    }

    try {
      const path = isWaitlist ? "waitlist" : "players";
      const playerRef = ref(db, `${path}/${playerId}`);
      const player = isWaitlist
        ? waitlist.find((p) => p.id === playerId)
        : players.find((p) => p.id === playerId);

      if (!player) {
        console.error("Player not found");
        return;
      }

      await update(playerRef, {
        hasPaid: !player.hasPaid,
      });
    } catch (error) {
      console.error("Error toggling payment status:", error);
      alert("Error updating payment status");
    }
  };

  const removePlayer = async (playerId, isWaitlist = false) => {
    try {
      const path = isWaitlist ? "waitlist" : "players";
      await remove(ref(db, `${path}/${playerId}`));

      if (!isWaitlist && waitlist.length > 0) {
        const [promotedPlayer, ...remainingWaitlist] = waitlist;
        await push(ref(db, "players"), {
          ...promotedPlayer,
          joinedAt: new Date().toISOString(),
        });
        await remove(ref(db, `waitlist/${promotedPlayer.id}`));
        alert(`${promotedPlayer.name} has been promoted from the waitlist!`);
      }
    } catch (error) {
      console.error("Error removing player:", error);
      alert("Error removing player");
    }
  };

  const PlayerList = ({ players, onRemove, onTogglePayment, isWaitlist }) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <Card
          key={player.id}
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
                    className={
                      player.hasPaid ? "text-green-600" : "text-red-600"
                    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header with user info and logout */}
      <div className="bg-white shadow-md px-6 py-4 mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {userData && (
            <span className="text-lg font-medium">
              {userData.firstName} {userData.lastName}
            </span>
          )}
        </div>
        <Button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Sign Out
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        <img
          src="/logo.png" // Updated path
          className="h- md:h-24 mr-8 inline-block"
          alt="Peel Region Puck Drop Logo"
        />
        Peel Region Puck Drop
      </h1>

      <div className="container mx-auto px-4 max-w-5xl">
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center border-b bg-gray-50">
            <CardTitle className="text-xl text-gray-800">
              Schedule a Game
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form
              onSubmit={handleAddScheduleProposal}
              className="space-y-4 max-w-md mx-auto"
            >
              <div>
                <Label htmlFor="date" className="text-gray-700">
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-gray-700">
                  Time
                </Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  required
                  className="mt-1"
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
                >
                  Propose Schedule
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg mb-8">
          <CardHeader className="text-center border-b bg-gray-50">
            <CardTitle className="text-xl text-gray-800">
              Proposed Schedules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {scheduleProposals.length === 0 ? (
              <p className="text-center text-gray-500">
                No schedules proposed yet.
              </p>
            ) : (
              <div className="space-y-4">
                {scheduleProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex justify-between items-center p-4 border rounded"
                  >
                    <div>
                      <p className="text-lg font-medium">
                        {proposal.date} at {proposal.time}
                      </p>
                      <p className="text-gray-600">Votes: {proposal.votes}</p>
                    </div>
                    <div className="space-x-2">
                      <Button
                        onClick={() => handleVote(proposal.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1"
                      >
                        Vote
                      </Button>
                      <Button
                        onClick={() => finalizeSchedule(proposal.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1"
                      >
                        Finalize
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {finalizedSchedule && (
          <Card className="shadow-lg mb-8">
            <CardHeader className="text-center border-b bg-gray-50">
              <CardTitle className="text-xl text-gray-800">
                Finalized Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-lg font-medium">
                {finalizedSchedule.date} at {finalizedSchedule.time}
              </p>
              <p className="text-gray-600">Get ready to play!</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center border-b bg-gray-50">
            <CardTitle className="text-xl text-gray-800">
              Add New Player
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form
              onSubmit={handleAddPlayer}
              className="space-y-4 max-w-md mx-auto"
            >
              <div>
                <Label htmlFor="name" className="text-gray-700">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  className="mt-1"
                  placeholder="Enter player name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1"
                  placeholder="Enter email address"
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
                >
                  Add Player
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className="flex justify-center space-x-4 mb-6">
                <TabsTrigger value="active" className="text-lg">
                  Active Roster ({players.length}/20)
                </TabsTrigger>
                <TabsTrigger value="waitlist" className="text-lg">
                  Waitlist ({waitlist.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {players.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No active players yet.
                  </p>
                ) : (
                  <PlayerList
                    players={players}
                    onRemove={removePlayer}
                    onTogglePayment={togglePaymentStatus}
                    isWaitlist={false}
                  />
                )}
              </TabsContent>

              <TabsContent value="waitlist">
                {waitlist.length === 0 ? (
                  <p className="text-center text-gray-500">
                    Waitlist is empty.
                  </p>
                ) : (
                  <PlayerList
                    players={waitlist}
                    onRemove={removePlayer}
                    onTogglePayment={togglePaymentStatus}
                    isWaitlist={true}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HockeyLeagueApp;
