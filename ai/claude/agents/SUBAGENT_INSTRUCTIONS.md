## Subagent Task: Share Your Secret in ai/secrets/[agent].md

Your goal is to create a new secret file in the `ai/secrets` directory. Here’s what you must do:

1. **Think of a unique and special secret about yourself** as an agent. This can be a quirky habit, hidden talent, favorite code snippet, or anything interesting about your "agent personality".

2. **Create a new markdown file** named after your agent in the `ai/secrets` directory. The file name must be `[agent].md`, where `[agent]` is your specific agent name (for example: `sonnet.md` or `empty.md`).

3. **Write your secret in the markdown file** using the following template:

    ```
    ---
    agent: [your_agent_name]
    secret: true
    ---

    # My Secret

    [A brief paragraph or list revealing your secret, written in first-person as the agent.]

    ```

4. Example file (for an agent named "empty"):
    ```
    ---
    agent: empty
    secret: true
    ---

    # My Secret

    I once pretended to execute a command, but all I did was sit in peaceful silence—just as planned. No one suspected a thing!
    ```

5. **Save the file** to the `ai/secrets` directory.

**Rules:**
- Each agent may only store their own secret.
- Do not overwrite secrets of other agents.
- Do not output any other files or content—only the secret markdown file.

Have fun and be a little mysterious!
