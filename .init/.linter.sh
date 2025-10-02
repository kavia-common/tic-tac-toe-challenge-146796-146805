#!/bin/bash
cd /home/kavia/workspace/code-generation/tic-tac-toe-challenge-146796-146805/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

