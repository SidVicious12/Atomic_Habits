import { faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js';
import { subDays, formatISO } from 'date-fns';
import dotenv from 'dotenv';

// Load environment variables from the root .env file
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Make sure they are in a .env file in the project root.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const seedDailyLogs = async () => {
  try {
    // IMPORTANT: To seed data, we need to sign in as a test user.
    // **NEVER COMMIT REAL USER CREDENTIALS TO YOUR REPOSITORY**
    const TEST_USER_EMAIL = process.env.VITE_TEST_USER_EMAIL;
    const TEST_USER_PASSWORD = process.env.VITE_TEST_USER_PASSWORD;

    if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
        console.error("\nPlease set VITE_TEST_USER_EMAIL and VITE_TEST_USER_PASSWORD in your .env file to seed data.\n");
        return;
    }

    console.log(`Attempting to authenticate as ${TEST_USER_EMAIL}...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

    if (authError || !authData.user) {
      console.error("Failed to authenticate test user:", authError?.message);
      return;
    }

    const userId = authData.user.id;
    console.log(`Authenticated as user: ${userId}. Starting to seed data...`);

    const logs = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      const log = {
        user_id: userId,
        log_date: formatISO(date, { representation: 'date' }), // 'YYYY-MM-DD'
        time_awake: `${faker.number.int({ min: 5, max: 8 })}:${faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')}`,
        bed_time: `${faker.number.int({ min: 21, max: 23 })}:${faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')}`,
        day_rating: faker.number.int({ min: 3, max: 10 }),
        weight_lbs: faker.number.float({ min: 150, max: 160, precision: 0.1 }).toFixed(1),
        calories: faker.number.int({ min: 1800, max: 2500 }),
        coffee_cups: faker.number.int({ min: 0, max: 4 }),
        water_bottles_count: faker.number.int({ min: 2, max: 8 }),
        pages_read_count: faker.number.int({ min: 0, max: 50 }),
        dabs_count: faker.number.int({ min: 0, max: 5 }),
        soda_cans: faker.number.int({ min: 0, max: 3 }),
        alcohol_drinks: faker.number.int({ min: 0, max: 4 }),
        phone_in_bed: faker.datatype.boolean(),
        breakfast: faker.datatype.boolean(),
        smoke_vape: faker.datatype.boolean(),
        netflix_in_bed: faker.datatype.boolean(),
        brushed_teeth: faker.datatype.boolean({ probability: 0.8 }),
        washed_face: faker.datatype.boolean({ probability: 0.8 }),
        morning_walk: faker.datatype.boolean({ probability: 0.4 }),
      };
      logs.push(log);
    }

    console.log('Deleting existing logs for the user to prevent duplicates...');
    const { error: deleteError } = await supabase
        .from('daily_logs')
        .delete()
        .eq('user_id', userId);

    if (deleteError) {
        console.error('Error deleting existing logs:', deleteError);
        return;
    }
    
    console.log('Inserting 30 new log entries...');
    const { error: insertError } = await supabase.from('daily_logs').insert(logs);

    if (insertError) {
      console.error('Error inserting seed data:', insertError);
    } else {
      console.log('Successfully seeded 30 days of daily logs!');
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
};

seedDailyLogs();
