#!/bin/bash
# Install Rate Limiting package

cd /home/jorge/projects/Lottery-Apis/src/LotteryApi

export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools

dotnet add package AspNetCoreRateLimit --version 5.0.0

echo "AspNetCoreRateLimit package installed successfully"
