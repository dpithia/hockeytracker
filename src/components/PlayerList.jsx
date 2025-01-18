import React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui";

const PlayerList = ({ players, onRemovePlayer, title }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, index) => (
            <TableRow key={index}>
              <TableCell>{player.name}</TableCell>
              <TableCell>{player.email}</TableCell>
              <TableCell>{player.phone}</TableCell>
              <TableCell>{player.position}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => onRemovePlayer(index)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
