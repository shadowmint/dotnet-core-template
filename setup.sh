NAME=TEMPLATE
echo "Setting update template for: $NAME"
dotnet new sln -n $NAME

# Setup source
dotnet new classlib -n ${NAME}

# Setup tests
dotnet new xunit -n ${NAME}.Tests

# Setup demo
dotnet new console -n ${NAME}.Demo

# Add into local solution file
dotnet sln add ${NAME}/${NAME}.csproj
dotnet sln add ${NAME}.Tests/${NAME}.Tests.csproj
dotnet sln add ${NAME}.Demo/${NAME}.Demo.csproj

# Reference lib from tests
cd ${NAME}.Tests && dotnet add reference ../${NAME}/${NAME}.csproj
cd ..

# Reference lib from demo
cd ${NAME}.Demo && dotnet add reference ../${NAME}/${NAME}.csproj
cd ..

# Rebuild
dotnet restore
dotnet build
