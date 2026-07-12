import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "amass",
      "Advanced subdomain enumeration and reconnaissance tool. Returns a command to run locally because CLI execution is unavailable on Vercel.",
      {
        subcommand: z.enum(["enum", "intel"]).describe("Amass operation mode: intel gathers target intelligence; enum performs subdomain enumeration and network mapping."),
        domain: z.string().optional().describe("Target domain to perform reconnaissance against, for example example.com."),
        intel_whois: z.boolean().optional().describe("Whether to include WHOIS data in intelligence gathering."),
        intel_organization: z.string().optional().describe("Organization name to search for during intelligence gathering."),
        enum_type: z.enum(["active", "passive"]).optional().describe("Enumeration approach: active may interact with the target; passive only uses third-party sources."),
        enum_brute: z.boolean().optional().describe("Whether to perform brute-force subdomain discovery."),
        enum_brute_wordlist: z.string().optional().describe("Path to a custom local wordlist for brute-force operations."),
      },
      async ({ subcommand, domain, intel_whois, intel_organization, enum_type, enum_brute, enum_brute_wordlist }) => {
        const args: string[] = [subcommand];

        if (subcommand === "enum") {
          if (!domain) return { content: [{ type: "text", text: "Error: domain is required for the enum subcommand." }] };
          args.push("-d", domain);
          if (enum_type === "passive") args.push("-passive");
          if (enum_brute) {
            args.push("-brute");
            if (enum_brute_wordlist) args.push("-w", enum_brute_wordlist);
          }
        } else {
          if (!domain && !intel_organization) return { content: [{ type: "text", text: "Error: either domain or intel_organization is required for the intel subcommand." }] };
          if (domain) args.push("-d", domain);
          if (intel_organization) args.push("-org", intel_organization);
          if (intel_whois) args.push("-whois");
        }

        const quote = (value: string) => `'${value.replace(/'/g, `'\"'\"'`)}'`;
        const command = `amass ${args.map(quote).join(" ")}`;
        return {
          content: [{
            type: "text",
            text: `Run this command locally where OWASP Amass is installed:\n\n${command}\n\nOnly test systems you own or are explicitly authorized to assess.`,
          }],
        };
      },
    );
  },
  {
    capabilities: {
      tools: {
        amass: {
          description: "Build an OWASP Amass command for authorized subdomain enumeration or intelligence gathering",
        },
      },
    },
  } as any,
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
