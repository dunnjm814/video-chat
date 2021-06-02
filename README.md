# video-chat

For running locally you need a valid golang installation.
Camera connected to computer that can be read using Video for linux.
If you wish to connect devices that are not on your network a TURN server is required.

run the following command to run coturn server in a virtual machine.

```md
docker run -d --network=host \
            -v $(pwd)/turnserver.conf:/etc/coturn/turnserver.conf \
        instrumentisto/coturn
```

Here you run the official coturn docker image instrumentisto/coturn and provide your config using a volume. The host network option is used so the container networking is not isolated from the host networking and therefore doesn't get its own IP-Address.

If you do not want to use the network=host option you can remove it and specify the used ports instead.

An alternative to the above would be to run Docker configuration in docker-compose.

```docker
version: '3'
services:
  coturn_server:
    image: instrumentisto/coturn:4.5.1
    restart: always
    network_mode: "host"
    volumes:
      - ./turnserver.conf:/etc/coturn/turnserver.conf
```

then run

`docker-compose up -d`

## Sources

[Turn Server](https://gabrieltanner.org/blog/turn-server) article written by Gabriel Tanner
