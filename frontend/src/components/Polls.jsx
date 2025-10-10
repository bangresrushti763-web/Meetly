import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import server from '../environment';

const socket = io(server);

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Polls = ({ roomId, isHost }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    socket.on("newPoll", (pollData) => setPoll(pollData));
    socket.on("updatePoll", (pollData) => setPoll(pollData));
    socket.on("pollEnded", () => setPoll(null));

    return () => {
      socket.off("newPoll");
      socket.off("updatePoll");
      socket.off("pollEnded");
    };
  }, []);

  const createPoll = () => {
    socket.emit("createPoll", { roomId, question, options });
  };

  const vote = (index) => {
    socket.emit("votePoll", { roomId, optionIndex: index });
  };

  const endPoll = () => {
    socket.emit("endPoll", { roomId });
  };

  // Function to add a new option field
  const addOption = () => {
    setOptions([...options, ""]);
  };

  // Function to update an option
  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 mt-4">
      <h2 className="text-lg font-bold mb-2">📊 Live Polls & Quizzes</h2>

      {!poll && isHost && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Poll Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="border border-gray-300 p-2 mb-2 w-full rounded-md"
          />
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              className="border border-gray-300 p-2 mb-2 w-full rounded-md"
            />
          ))}
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={addOption}
              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md"
            >
              ➕ Add Option
            </button>
            <button
              onClick={createPoll}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
              disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
            >
              ✅ Start Poll
            </button>
          </div>
        </div>
      )}

      {poll && (
        <div>
          <h3 className="font-semibold text-lg mb-2">{poll.question}</h3>
          <ul className="mb-4">
            {poll.options.map((opt, i) => (
              <li key={i} className="flex items-center gap-2 mb-2">
                {!isHost && (
                  <button
                    onClick={() => vote(i)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
                  >
                    Vote
                  </button>
                )}
                <span className="flex-1">{opt}</span>
                <span className="font-semibold">({poll.votes[i]} votes)</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center">
            <PieChart width={300} height={300}>
              <Pie
                data={poll.options.map((opt, i) => ({
                  name: opt,
                  value: poll.votes[i],
                }))}
                cx={150}
                cy={150}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {poll.options.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          {isHost && (
            <div className="flex justify-center mt-4">
              <button
                onClick={endPoll}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                🛑 End Poll
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Polls;