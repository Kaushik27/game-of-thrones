# ADR 003: Use GitHub Pages and a free container service

- Status: Accepted
- Context: GitHub Pages cannot execute Spring Boot, while the portfolio should preserve both the cinematic static site and the enterprise teaching application.
- Decision: Deploy the static edition to GitHub Pages and define the enterprise container through a Render free-plan Blueprint.
- Consequences: The enterprise service can sleep after inactivity and its first response can be slow. H2 is rebuilt after ephemeral storage loss. No paid resources or persistent disks are configured.
