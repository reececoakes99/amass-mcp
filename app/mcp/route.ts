import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const shellQuote = (value: string) => `'${value.replace(/'/g, `'"'"'`)}'`;

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "amass",
      "Build an OWASP Amass subdomain enumeration or intelligence command for authorized reconnaissance. CLI execution is unavailable on Vercel, so this tool returns a command to run locally.",
      {
        subcommand: z.enum(["enum", "intel"]).describe("Amass operation mode: enum performs subdomain enumeration; intel gathers intelligence about target domains."),
        domain: z.string().optional().describe("Target domain to investigate, for example example.com."),
        intel_whois: z.boolean().optional().describe("Include WHOIS data during intelligence gathering."),
        intel_organization: z.string().optional().describe("Organization name to search for during intelligence gathering."),
        enum_type: z.enum(["active", "passive"]).optional().describe("Enumeration approach: active may interact with the target; passive uses third-party sources."),
        enum_brute: z.boolean().optional().describe("Enable brute-force subdomain discovery."),
        enum_brute_wordlist: z.string().optional().describe("Path to a custom local wordlist for brute-force operations."),
      },
      async ({ subcommand, domain, intel_whois, intel_organization, enum_type, enum_brute, enum_brute_wordlist }) => {
        const args: string[] = [subcommand];

        if (subcommand === "enum") {
          if (!domain) throw new Error("The domain parameter is required for the enum subcommand.");
          args.push("-d", domain);
          if (enum_type === "passive") args.push("-passive");
          if (enum_brute) {
            args.push("-brute");
            if (enum_brute_wordlist) args.push("-w", enum_brute_wordlist);
          }
        } else {
          if (!domain && !intel_organization) throw new Error("Either domain or intel_organization is required for the intel subcommand.");
          if (domain) args.push("-d", domain);
          if (intel_organization) args.push("-org", intel_organization);
          if (intel_whois) args.push("-whois");
        }

        const command = `amass ${args.map(shellQuote).join(" ")}`;
        return {
          content: [{
            type: "text" as const,
            text: `Run this command locally on a system with OWASP Amass installed:\n\n${command}\n\nOnly run reconnaissance against systems you own or are explicitly authorized to test. Vercel serverless functions cannot execute the Amass CLI, so this MCP tool safely generates the command instead.`,
          }],
        };
      },
    );
  },
  {
    capabilities: {
      tools: {
        amass: { description: "Build an OWASP Amass command for authorized subdomain enumeration or intelligence gathering" },
      },
    },
  } as any,
  { basePath: "", verboseLogs: true, maxDuration: 60, disableSse: true },
);

export { handler as GET, handler as POST, handler as DELETE };
