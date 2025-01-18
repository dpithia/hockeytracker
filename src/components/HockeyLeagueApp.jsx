// src/components/HockeyLeagueApp.jsx
import React, { useState } from "react";
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
// Or if using the default export
// import emailService from '../utils/emailService';
const HockeyLeagueApp = () => {
  const [players, setPlayers] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [scheduleProposals, setScheduleProposals] = useState([]);
  const [finalizedSchedule, setFinalizedSchedule] = useState(null);

  const handleAddScheduleProposal = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newProposal = {
      date: formData.get("date"),
      time: formData.get("time"),
      votes: 0, // Initially, no votes
    };
    setScheduleProposals([...scheduleProposals, newProposal]);
    event.target.reset();
  };

  const handleVote = (index) => {
    setScheduleProposals(
      scheduleProposals.map((proposal, i) =>
        i === index ? { ...proposal, votes: proposal.votes + 1 } : proposal
      )
    );
  };

  const finalizeSchedule = (index) => {
    const selectedProposal = scheduleProposals[index];
    setFinalizedSchedule(selectedProposal);
    alert(
      `Schedule finalized: ${selectedProposal.date} at ${selectedProposal.time}`
    );
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

    console.log("Attempting to add player:", newPlayer);

    if (players.length < 20) {
      try {
        const emailTemplate = emailTemplates.activeRosterJoin(newPlayer.name);
        console.log("Using email template:", emailTemplate);

        const emailSent = await sendEmail(newPlayer.email, emailTemplate);

        console.log("Email sent result:", emailSent);

        if (emailSent) {
          console.log("Email sent successfully");
          setPlayers([...players, newPlayer]);
        } else {
          console.error("Failed to send email");
          alert("Player added, but email failed to send");
          setPlayers([...players, newPlayer]);
        }
      } catch (error) {
        console.error("Comprehensive error adding player:", error);
        alert("Error adding player");
      }
    } else {
      // Similar logic for waitlist with added logging
      try {
        const emailTemplate = emailTemplates.waitlistJoin(newPlayer.name);
        console.log("Using waitlist email template:", emailTemplate);

        const emailSent = await sendEmail(newPlayer.email, emailTemplate);

        console.log("Waitlist email sent result:", emailSent);

        if (emailSent) {
          console.log("Waitlist email sent successfully");
          setWaitlist([...waitlist, newPlayer]);
        } else {
          console.error("Failed to send waitlist email");
          alert("Player added to waitlist, but email failed to send");
          setWaitlist([...waitlist, newPlayer]);
        }
      } catch (error) {
        console.error("Error adding player to waitlist:", error);
        alert("Error adding player to waitlist");
      }
    }

    event.target.reset();
  };

  const togglePaymentStatus = (index, isWaitlist) => {
    if (isWaitlist) {
      setWaitlist(
        waitlist.map((player, i) =>
          i === index ? { ...player, hasPaid: !player.hasPaid } : player
        )
      );
    } else {
      setPlayers(
        players.map((player, i) =>
          i === index ? { ...player, hasPaid: !player.hasPaid } : player
        )
      );
    }
  };

  const removePlayer = (index, isWaitlist = false) => {
    if (isWaitlist) {
      setWaitlist(waitlist.filter((_, i) => i !== index));
    } else {
      setPlayers(players.filter((_, i) => i !== index));

      if (waitlist.length > 0) {
        const [promotedPlayer, ...remainingWaitlist] = waitlist;
        setPlayers((prevPlayers) => [...prevPlayers, promotedPlayer]);
        setWaitlist(remainingWaitlist);
        alert(`${promotedPlayer.name} has been promoted from the waitlist!`);
      }
    }
  };

  const PlayerList = ({ players, onRemove, onTogglePayment, isWaitlist }) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {players.map((player, index) => (
        <Card
          key={index}
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
                  onClick={() => onRemove(index, isWaitlist)}
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
                  onClick={() => onTogglePayment(index, isWaitlist)}
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        <img
          src="src/assets/logo.png"
          className="h- md:h-12 mr-4 inline-block"
        />
        Peel Region Puck Drop
      </h1>
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Other components remain the same */}
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
                {scheduleProposals.map((proposal, index) => (
                  <div
                    key={index}
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
                        onClick={() => handleVote(index)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1"
                      >
                        Vote
                      </Button>
                      <Button
                        onClick={() => finalizeSchedule(index)}
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
          <Card className="shadow-lg">
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
      </div>
      <div className="container mx-auto px-4 max-w-5xl">
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
