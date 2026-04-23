import 'dotenv/config';
import express from 'express';
import { google } from 'googleapis';
import { ManagementClient } from 'auth0';
import { auth } from 'express-oauth2-jwt-bearer';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json());

const checkJwt = auth({
    audience: process.env.VITE_AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.VITE_AUTH0_DOMAIN}`,
});

type Auth0Identity = {
  provider?: string;
  access_token?: string;
};

async function getGoogleToken(auth0UserId: string) {
  const mgmt = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_MGMT_CLIENT_ID!,
    clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET!,
  });
  const user = await mgmt.users.get(auth0UserId);
  const identities = user.identities as Auth0Identity[] | undefined;
  const googleIdentity = identities?.find(i => i.provider === 'google-oauth2');
  return googleIdentity?.access_token;
}

app.get('/api/calendar/events', checkJwt, async (req, res) => {
    const userSub = req.auth?.payload?.sub as string | undefined;
    if (!userSub) return res.status(401).json({ error: 'Unauthorized' });

    const events = await prisma.event.findMany({
        where: { userId: userSub },
        orderBy: { startTime: 'asc' },
    });
    res.json(events);
});

app.post('/api/calendar/event', checkJwt, async (req, res) => {
    const event = await prisma.event.create({
        data: {
            userId: req.auth!.payload.sub!,
            title: req.body.title,
            startTime: new Date(req.body.start),
            endTime: new Date(req.body.end),
        },
    });
    res.json(event);
});

app.delete('/api/calendar/event/:id', checkJwt, async (req, res) => {
    await prisma.event.delete({
        where: { id: req.params.id as string, userId: req.auth!.payload.sub! },
    });
    res.json({ success: true });
});

app.post('/api/calendar/import-google', checkJwt, async (req, res) => {
    const googleToken = await getGoogleToken(req.auth!.payload.sub!);

    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({ access_token: googleToken });

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
    });

    const googleEvents = response.data.items || [];
    let imported = 0;

    for (const e of googleEvents) {
        const existing = await prisma.event.findFirst({
            where: { googleId: e.id! }
        });
        if (existing) continue;

        await prisma.event.create({
            data: {
                userId: req.auth!.payload.sub!,
                title: e.summary || 'Untitled',
                startTime: new Date(e.start?.dateTime || e.start?.date!),
                endTime: new Date(e.end?.dateTime || e.end?.date!),
                googleId: e.id,
            },
        });
        imported++;
    }

    res.json({ imported });
});

app.listen(3001, () => console.log('API running on :3001'));