#!/bin/bash

terminateTree() {

    local pid=$1
    local signal=$2

    for cpid in $(pgrep -P $1); do
        terminateTree $cpid $signal
	done
	kill -$signal $pid > /dev/null 2>&1
}

# Check if the correct number of arguments is provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <signal> <pid> [<pid>...]"
    echo "  signal: TERM for soft kill or KILL for hard kill"
    exit 1
fi

# Get the signal and validate it
signal=$1
if [ "$signal" != "TERM" ] && [ "$signal" != "KILL" ]; then
    echo "Invalid signal: $signal. Use TERM or KILL."
    exit 1
fi

# Convert the signal to the corresponding signal number
if [ "$signal" == "TERM" ]; then
    signal_num=15
elif [ "$signal" == "KILL" ]; then
    signal_num=9
fi

# Process each PID
shift
for pid in $*; do
    terminateTree $pid $signal_num
done
