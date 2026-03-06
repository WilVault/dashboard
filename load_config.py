import tomllib
import sys

def generate(env="local"):
    # Read the config.toml file
    with open("config.toml", "rb") as f:
        config = tomllib.load(f)

    # Choose backend config based on environment (local or docker)
    backend = config["backend"].get(env, config["backend"]) if env != "local" else config["backend"]

    # Choose frontend config based on environment
    frontend = config["frontend"].get(env, config["frontend"]) if env != "local" else config["frontend"]

    # Generate backend/.env file
    with open("backend/.env", "w") as f:
        for k, v in backend.items():
            # Write only simple key=value pairs (skip nested configs)
            if isinstance(v, str):
                f.write(f"{k}={v}\n")
    print("SUCCESS: backend/.env generated")

    # Generate frontend/.env file
    with open("frontend/.env", "w") as f:
        for k, v in frontend.items():
            if isinstance(v, str):
                f.write(f"{k}={v}\n")
    print("SUCCESS: frontend/.env generated")

if __name__ == "__main__":
    # Use command line argument if provided, otherwise default to "local"
    env = sys.argv[1] if len(sys.argv) > 1 else "local"
    generate(env)