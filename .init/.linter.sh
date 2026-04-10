#!/bin/bash
cd /tmp/code-generation/tic-tac-toe-classic-2438-2452/tic_tac_toe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

