export const USER_GUIDE = `
========================================
G&S GOOD STUFF — COMPLETE USER GUIDE
========================================

Hey Gary (and Suzy)! This guide covers every feature in the G&S Good Stuff app.
Think of it as your field manual. If you ever get stuck, just ask Borden — he
knows all of this too.


1. GETTING STARTED
------------------

- Open the app on your phone or computer. You'll see a login screen.
- Sign in with your email and password. Once you're in, you stay logged in.
- At the bottom of the screen, you'll see five tabs: Map, Inventory, Borden, Tasks, and More.
- Tap any tab to switch between sections. That's your main navigation.

Here's what each tab does at a glance:
  * Map — Your farm layout. Draw zones, see where everything is planted.
  * Inventory — All your dahlia varieties. Track them from storage to sale.
  * Borden — Your AI farm advisor. Ask him anything about the farm.
  * Tasks — Your to-do list. What needs doing today, tomorrow, this week.
  * More — Everything else: equipment, business planning, weather, orders, revenue, calendar, settings.

- At the bottom center, you'll see a small sync indicator:
  * Green "Synced" means your data is saved to the cloud.
  * Blue "Syncing..." means it's uploading changes.
  * Red "Offline" means you have no internet — but don't worry, everything still works! Changes will sync when you're back online.


2. MAP TAB
----------

The Map tab shows a satellite view of your property centered on Addison. This is
where you lay out your growing zones and site features.

VIEWING THE MAP:
- Pinch to zoom in/out. Drag to pan around.
- The satellite imagery shows your actual property — buildings, trees, roads, everything.
- Your zones appear as colored outlines on the map.

DRAWING A NEW ZONE:
- Tap the draw button (pencil icon) to enter drawing mode.
- Tap on the map to place each corner (vertex) of your zone. Each tap adds a point.
- When you've placed all the corners, tap the first point again or tap "Done" to close the shape.
- Give your zone a name (like "Front Field", "Hillside", "Garden Bed A").

EDITING A ZONE:
- Tap on a zone to select it.
- You'll see the corner points (vertices) highlighted.
- Drag any vertex to reshape the zone.
- The area and perimeter update automatically as you drag.

DELETING A ZONE:
- Select the zone, then tap the delete/trash icon.
- You'll get a confirmation — tap Yes to delete.

ZONE DETAIL:
- Tap a zone to open its detail panel. Here you can see and manage:
  * Zone name and color
  * Area (in square feet) and perimeter (in feet) — calculated automatically
  * Varieties assigned to this zone
  * Checklist — tasks specific to this zone (soil prep, irrigation, mulch, etc.)
  * Photos — attach photos of the zone at different stages

SITE FEATURES:
- Beyond growing zones, you can add site features to the map:
  * Walkway — paths between zones
  * Fence — deer fence, property fence
  * Irrigation — water lines
  * Driveway — vehicle access
  * Building — barn, shed, house
  * Wet Area — low spots that hold water
  * Well Point — well location
  * Hazard — anything to watch out for
  * Steep Grade — sloped areas
  * Brush — uncleared brush areas
  * Trees — tree lines or groves
  * Custom — anything else
- Each feature type has its own color and icon on the map.
- Features can be polygons (areas), lines, or points depending on the type.

GRID OVERLAY:
- Toggle the grid overlay to see a measurement grid over your map.
- Useful for spacing calculations and planning bed layouts.

DIMENSION LABELS:
- When a zone is selected, dimension labels show the length of each side.
- Helps you know exact measurements without a tape measure.

SNAP TOOL:
- When drawing or editing zones, the snap tool helps vertices align to nearby points.
- Makes it easy to create zones that share edges neatly.

90-DEGREE TOOL:
- Forces corners to right angles when drawing.
- Great for rectangular beds and straight-edged zones.


3. INVENTORY TAB
----------------

This is the heart of the app — every dahlia variety you own, from storage to sale.

VIEWING VARIETIES:
- You'll see a list (or grid) of all your varieties.
- Each variety shows its name, status, photo (if you've added one), and quantity.

FILTER CHIPS:
- At the top, you'll see filter buttons for each lifecycle status:
  stored, jugged, planted, growing, dug, divided, listed, sold
- Tap a chip to show only varieties in that status.
- Tap it again to clear the filter.
- You can combine filters.

SEARCH:
- There's a search bar at the top. Type any part of a variety name to find it quickly.
- Searching "Cafe" would find "Cafe au Lait", for example.

CREATING A NEW VARIETY:
- Tap the + button (usually bottom-right corner).
- Fill in the variety name, bloom form, color, size, and any notes.
- It starts in "stored" status by default.

EDITING VARIETY DETAILS:
- Tap on any variety to open its detail sheet.
- You can edit the name, description, bloom form, color, quantity, zone assignment, price, and notes.
- Changes save automatically.

ADVANCING LIFECYCLE STATUS:
- This is the big one. Every tuber follows this lifecycle:
    stored -> jugged -> planted -> growing -> dug -> divided -> listed -> sold
- On the variety detail sheet, you'll see the current status and a button to advance to the next stage.
- Each status change is tracked with a timestamp.
- Here's what each status means:
    * Stored — Tubers are in the cooler, dormant, waiting for spring.
    * Jugged — You've started them in milk jugs indoors to get a head start.
    * Planted — In the ground, in their zone.
    * Growing — Actively growing, green above ground.
    * Dug — Pulled from the ground after first frost or end of season.
    * Divided — Clumps have been divided into individual tubers.
    * Listed — Posted for sale on the storefront.
    * Sold — A customer bought it.

SELLING (RECORD SALE):
- When a variety is in "listed" status, you can tap "Record Sale."
- This creates an order, moves the variety to "sold" status, and updates your revenue tracking.

SPLITTING INVENTORY:
- If you have 10 tubers of one variety and want to sell 3, you can split the inventory.
- This creates a separate entry for the portion you're selling while keeping the rest.

ADDING PHOTOS:
- On the variety detail sheet, tap the camera/photo icon.
- Take a new photo or choose from your photo library.
- Photos are uploaded to cloud storage and attached to the variety.
- If you're offline, photos are cached and uploaded when you reconnect.

CHECKLISTS PER VARIETY:
- Each variety has a checklist that changes based on its current status.
- For example, when a variety is in "planted" status, the checklist might include:
    * Dig hole 6 inches deep
    * Add bone meal
    * Water in thoroughly
    * Mark with stake
- You can add custom items, check them off, and set due dates on individual items.
- Preset checklist items are suggested for each lifecycle stage.


4. BORDEN TAB (AI FARM ADVISOR)
-------------------------------

Borden is your AI assistant who knows your farm inside and out. He has access to
all your farm data — zones, varieties, tasks, equipment, weather, and orders.

WHAT BORDEN IS:
- An AI advisor trained on dahlia growing, your specific farm data, and general farming wisdom.
- He speaks practically and directly — like a knowledgeable neighbor.
- He's not a search engine; he actually knows YOUR farm.

WHAT TO ASK HIM:
- "What should I be doing this week?"
- "Which varieties are still in storage?"
- "When should I plant based on the weather forecast?"
- "How many tubers do I have listed for sale?"
- "What's the status of Zone 3?"
- "Any equipment overdue for service?"
- "How's the revenue looking this month?"
- "What's the best time to dig dahlias in Zone 5b?"
- "Help me plan my division schedule."
- Any "how do I..." question about using the app.

WHAT ACTIONS HE CAN TAKE:
- Create tasks for you (e.g., "Create a task to check the irrigation this Friday")
- Update variety status (e.g., "Move all the Cafe au Lait to planted")
- Add checklist items to zones or varieties
- Log journal entries
- Check the weather forecast and alert you to frost risks
- He'll always ask before making significant changes.

CONVERSATION HISTORY:
- Your conversations with Borden are saved.
- You can scroll back to see previous chats.
- He remembers context within a conversation.

SUGGESTED PROMPTS:
- When you open the Borden tab, you may see suggested questions based on the current season and your farm status.


5. TASKS TAB
------------

Your to-do list for the farm. Tasks can come from you, from Borden, or from checklists.

VIEWING TASKS:
- Tasks are grouped by date: Overdue, Today, Tomorrow, This Week, Later.
- Each task shows its title, due date, and priority (if set).

CREATING A TASK:
- Tap the + button.
- Enter a title, set a due date, and optionally set a priority (urgent, high, medium, low).
- Save it and it appears in the list.

COMPLETING A TASK:
- Tap the checkbox next to a task to mark it done.
- Completed tasks move to a "Done" section.

REOPENING A TASK:
- If you checked it off by mistake, tap it again to reopen it.

SNOOZING A TASK (+1 DAY):
- Swipe or tap the snooze button to push a task to tomorrow.
- Quick way to defer something without editing the due date.

DISMISSING A TASK:
- If a task is no longer relevant, dismiss it.
- It won't show up in your active list anymore.

EDITING:
- Tap on a task to edit its title, due date, or priority.
- Changes save automatically.

DELETING A TASK:
- Open the task and tap delete/trash.
- Confirmation required.

CHECKLISTS VIEW:
- At the top of the Tasks tab, you can switch to "Checklists" view.
- This aggregates all checklist items from all zones, varieties, and equipment into one view.
- Great for seeing everything that needs checking across the whole farm.


6. MORE TAB
-----------

The "More" tab is your portal to everything beyond the core map/inventory/tasks workflow.

EQUIPMENT (Fleet Manager):
- Track all your farm equipment: tractors, mowers, tillers, trucks, etc.
- For each piece of equipment:
    * Name, make, model, year
    * Service intervals (e.g., oil change every 50 hours)
    * Maintenance log — record every service performed
    * Hours tracking — log usage hours
    * Photos — snap photos of equipment, damage, serial numbers
    * Checklists — pre-use inspections, seasonal maintenance
- Borden will flag equipment that's overdue for service.

BUSINESS:
- Dashboard — overview of your operation's health
- Milestones — key achievements and targets
- Budget — income and expense tracking
- 5-Year Plan — your growth roadmap from 400 tubers in 2026 to 82,000+ by 2030

WEATHER:
- 7-day forecast for Addison, NY (your exact coordinates)
- Soil temperature readings — critical for knowing when to plant (need 60 degrees F)
- Frost alerts — flagged urgently during the growing season (May 15 - Oct 1)
- Historical charts — temperature and precipitation trends

ORDERS:
- View all orders — from the storefront and manually created ones
- Order status progression: received -> packing -> shipped -> delivered
- Packing slips — printable packing slip for each order
- Create manual orders — for sales at the farm stand, markets, or direct sales

REVENUE:
- KPIs — key performance indicators at a glance (total revenue, average order value, etc.)
- Monthly charts — revenue over time
- Variety ROI — which varieties are your best sellers and best earners

CALENDAR:
- View modes: Day, Week, Month, Quarter
- Shows due dates from tasks and checklists
- Color-coded by type (tasks, zone checklists, variety checklists, equipment)
- Tap any item on the calendar to edit it
- Great for planning your week at a glance

SETTINGS:
- Frost dates — set your last spring frost and first fall frost dates
- Shipping — configure shipping options and rates for the storefront
- Notifications — control what alerts you receive
- Social links — your Instagram, TikTok, Facebook, Pinterest links
- Data export — export your farm data


7. STOREFRONT (PUBLIC WEBSITE)
------------------------------

Your storefront is the public-facing website where customers browse and buy your dahlias.

HOW IT WORKS:
- When you advance a variety to "listed" status in the Inventory tab, it appears on the storefront automatically.
- The storefront shows variety photos, descriptions, bloom forms, prices, and availability.
- Customers can add items to their cart and check out.

HOW ORDERS COME IN:
- When a customer completes a purchase, an order appears in your Orders section (under More tab).
- You'll see the customer's name, shipping address, items ordered, and payment status.
- Process the order: pack the tubers, print a packing slip, mark as shipped.

INVENTORY CONNECTION:
- The storefront pulls directly from your inventory. If something is sold out, it won't show as available.
- If you move a variety back from "listed" to another status, it disappears from the storefront.


8. TIPS AND TRICKS
------------------

OFFLINE SUPPORT:
- The app works offline! This is critical because you're in the field 80% of the time.
- You can view all your data, create tasks, update statuses, take photos — all without internet.
- When you reconnect (WiFi, cell signal), everything syncs automatically.

SYNC INDICATOR:
- Watch the little indicator at the bottom of the screen:
    * Green "Synced" — all good, cloud is up to date
    * Blue "Syncing..." — uploading changes now
    * Red "Offline" — no internet, but keep working

PHOTO UPLOAD OFFLINE CACHING:
- If you take photos while offline, they're stored locally on your phone.
- When you get back online, they upload automatically in the background.
- You might see a brief delay before photos appear on other devices.

GENERAL TIPS:
- Use Borden liberally. He can create tasks, update statuses, and answer questions faster than tapping through menus.
- Check the Calendar at the start of each week to plan your work.
- Keep equipment hours updated — Borden uses them to flag overdue service.
- Take photos at every lifecycle stage. You'll thank yourself when it's time to write storefront descriptions.
- The 5-Year Plan in Business helps you see the big picture. Review it monthly.
- Export your data periodically from Settings as a backup.

========================================
That's everything! If something isn't covered here, ask Borden. He's always happy to help.
========================================
`;
