FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY SmrScheduler.Core/SmrScheduler.Core.csproj SmrScheduler.Core/
COPY SmrScheduler.Infrastructure/SmrScheduler.Infrastructure.csproj SmrScheduler.Infrastructure/
COPY SmrScheduler.Api/SmrScheduler.Api.csproj SmrScheduler.Api/
RUN dotnet restore SmrScheduler.Api/SmrScheduler.Api.csproj

COPY SmrScheduler.Core/ SmrScheduler.Core/
COPY SmrScheduler.Infrastructure/ SmrScheduler.Infrastructure/
COPY SmrScheduler.Api/ SmrScheduler.Api/
RUN dotnet publish SmrScheduler.Api/SmrScheduler.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "SmrScheduler.Api.dll"]
