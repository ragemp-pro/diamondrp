/// <reference path="../../declaration/server.ts" />
import { methods } from '../modules/methods';
import { business } from '../business';
import { user } from '../user';
import { menu } from '../modules/menu';
// import config from '../config/tattoos.json'
let config = [
    ["Turbulence", "mpairraces_overlays", "MP_Airraces_Tattoo_000_M", "MP_Airraces_Tattoo_000_F", "ZONE_TORSO", 13205],
    ["Pilot Skull", "mpairraces_overlays", "MP_Airraces_Tattoo_001_M", "MP_Airraces_Tattoo_001_F", "ZONE_TORSO", 18105],
    ["Winged Bombshell", "mpairraces_overlays", "MP_Airraces_Tattoo_002_M", "MP_Airraces_Tattoo_002_F", "ZONE_TORSO", 16485],
    ["Toxic Trails", "mpairraces_overlays", "MP_Airraces_Tattoo_003_M", "MP_Airraces_Tattoo_003_F", "ZONE_LEFT_ARM", 11985],
    ["Balloon Pioneer", "mpairraces_overlays", "MP_Airraces_Tattoo_004_M", "MP_Airraces_Tattoo_004_F", "ZONE_TORSO", 10390],
    ["Parachute Belle", "mpairraces_overlays", "MP_Airraces_Tattoo_005_M", "MP_Airraces_Tattoo_005_F", "ZONE_TORSO", 15270],
    ["Bombs Away", "mpairraces_overlays", "MP_Airraces_Tattoo_006_M", "MP_Airraces_Tattoo_006_F", "ZONE_TORSO", 12520],
    ["Eagle Eyes", "mpairraces_overlays", "MP_Airraces_Tattoo_007_M", "MP_Airraces_Tattoo_007_F", "ZONE_TORSO", 13925],
    ["Ship Arms", "mpbeach_overlays", "MP_Bea_M_Back_000", "", "ZONE_TORSO", 7250],
    ["Tribal Hammerhead", "mpbeach_overlays", "MP_Bea_M_Chest_000", "", "ZONE_TORSO", 5800],
    ["Tribal Shark", "mpbeach_overlays", "MP_Bea_M_Chest_001", "", "ZONE_TORSO", 5900],
    ["Pirate Skull", "mpbeach_overlays", "MP_Bea_M_Head_000", "", "ZONE_HEAD", 12000],
    ["Surf LS", "mpbeach_overlays", "MP_Bea_M_Head_001", "", "ZONE_HEAD", 1450],
    ["Shark", "mpbeach_overlays", "MP_Bea_M_Head_002", "", "ZONE_HEAD", 1850],
    ["Tribal Star", "mpbeach_overlays", "MP_Bea_M_Lleg_000", "", "ZONE_LEFT_LEG", 4450],
    ["Tribal Tiki Tower", "mpbeach_overlays", "MP_Bea_M_Rleg_000", "", "ZONE_RIGHT_LEG", 6500],
    ["Tribal Sun", "mpbeach_overlays", "MP_Bea_M_RArm_000", "", "ZONE_RIGHT_ARM", 6200],
    ["Tiki Tower", "mpbeach_overlays", "MP_Bea_M_LArm_000", "", "ZONE_LEFT_ARM", 4800],
    ["Mermaid L.S.", "mpbeach_overlays", "MP_Bea_M_LArm_001", "", "ZONE_LEFT_ARM", 6600],
    ["Little Fish", "mpbeach_overlays", "MP_Bea_M_Neck_000", "", "ZONE_HEAD", 1650],
    ["Surfs Up", "mpbeach_overlays", "MP_Bea_M_Neck_001", "", "ZONE_HEAD", 2250],
    ["Vespucci Beauty", "mpbeach_overlays", "MP_Bea_M_RArm_001", "", "ZONE_RIGHT_ARM", 7000],
    ["Swordfish", "mpbeach_overlays", "MP_Bea_M_Stom_000", "", "ZONE_TORSO", 3100],
    ["Wheel", "mpbeach_overlays", "MP_Bea_M_Stom_001", "", "ZONE_TORSO", 5500],
    ["Rock Solid", "mpbeach_overlays", "", "MP_Bea_F_Back_000", "ZONE_TORSO", 5500],
    ["Hibiscus Flower Duo", "mpbeach_overlays", "", "MP_Bea_F_Back_001", "ZONE_TORSO", 6900],
    ["Shrimp", "mpbeach_overlays", "", "MP_Bea_F_Back_002", "ZONE_TORSO", 2500],
    ["Anchor", "mpbeach_overlays", "", "MP_Bea_F_Chest_000", "ZONE_TORSO", 2500],
    ["Anchor", "mpbeach_overlays", "", "MP_Bea_F_Chest_001", "ZONE_TORSO", 2500],
    ["Los Santos Wreath", "mpbeach_overlays", "", "MP_Bea_F_Chest_002", "ZONE_TORSO", 8500],
    ["Love Dagger", "mpbeach_overlays", "", "MP_Bea_F_RSide_000", "ZONE_TORSO", 6850],
    ["School of Fish", "mpbeach_overlays", "", "MP_Bea_F_RLeg_000", "ZONE_RIGHT_LEG", 2950],
    ["Tribal Fish", "mpbeach_overlays", "", "MP_Bea_F_RArm_001", "ZONE_RIGHT_ARM", 3700],
    ["Tribal Butterfly", "mpbeach_overlays", "", "MP_Bea_F_Neck_000", "ZONE_HEAD", 1700],
    ["Sea Horses", "mpbeach_overlays", "", "MP_Bea_F_Should_000", "ZONE_TORSO", 5100],
    ["Catfish", "mpbeach_overlays", "", "MP_Bea_F_Should_001", "ZONE_TORSO", 5250],
    ["Swallow", "mpbeach_overlays", "", "MP_Bea_F_Stom_000", "ZONE_TORSO", 2100],
    ["Hibiscus Flower", "mpbeach_overlays", "", "MP_Bea_F_Stom_001", "ZONE_TORSO", 2650],
    ["Dolphin", "mpbeach_overlays", "", "MP_Bea_F_Stom_002", "ZONE_TORSO", 1900],
    ["Tribal Flower", "mpbeach_overlays", "", "MP_Bea_F_LArm_000", "ZONE_LEFT_ARM", 3500],
    ["Parrot", "mpbeach_overlays", "", "MP_Bea_F_LArm_001", "ZONE_LEFT_ARM", 5250],
    ["Demon Rider", "mpbiker_overlays", "MP_MP_Biker_Tat_000_M", "MP_MP_Biker_Tat_000_F", "ZONE_TORSO", 6720],
    ["Both Barrels", "mpbiker_overlays", "MP_MP_Biker_Tat_001_M", "MP_MP_Biker_Tat_001_F", "ZONE_TORSO", 10800],
    ["Rose Tribute", "mpbiker_overlays", "MP_MP_Biker_Tat_002_M", "MP_MP_Biker_Tat_002_F", "ZONE_LEFT_LEG", 16820],
    ["Web Rider", "mpbiker_overlays", "MP_MP_Biker_Tat_003_M", "MP_MP_Biker_Tat_003_F", "ZONE_TORSO", 10850],
    ["Dragon's Fury", "mpbiker_overlays", "MP_MP_Biker_Tat_004_M", "MP_MP_Biker_Tat_004_F", "ZONE_RIGHT_LEG", 17950],
    ["Made In America", "mpbiker_overlays", "MP_MP_Biker_Tat_005_M", "MP_MP_Biker_Tat_005_F", "ZONE_TORSO", 9230],
    ["Chopper Freedom", "mpbiker_overlays", "MP_MP_Biker_Tat_006_M", "MP_MP_Biker_Tat_006_F", "ZONE_TORSO", 10400],
    ["Swooping Eagle", "mpbiker_overlays", "MP_MP_Biker_Tat_007_M", "MP_MP_Biker_Tat_007_F", "ZONE_RIGHT_ARM", 5100],
    ["Freedom Wheels", "mpbiker_overlays", "MP_MP_Biker_Tat_008_M", "MP_MP_Biker_Tat_008_F", "ZONE_TORSO", 8785],
    ["Morbid Arachnid", "mpbiker_overlays", "MP_MP_Biker_Tat_009_M", "MP_MP_Biker_Tat_009_F", "ZONE_HEAD", 6350],
    ["Skull Of Taurus", "mpbiker_overlays", "MP_MP_Biker_Tat_010_M", "MP_MP_Biker_Tat_010_F", "ZONE_TORSO", 11350],
    ["R.I.P. My Brothers", "mpbiker_overlays", "MP_MP_Biker_Tat_011_M", "MP_MP_Biker_Tat_011_F", "ZONE_TORSO", 12350],
    ["Urban Stunter", "mpbiker_overlays", "MP_MP_Biker_Tat_012_M", "MP_MP_Biker_Tat_012_F", "ZONE_LEFT_ARM", 4985],
    ["Demon Crossbones", "mpbiker_overlays", "MP_MP_Biker_Tat_013_M", "MP_MP_Biker_Tat_013_F", "ZONE_TORSO", 11140],
    ["Lady Mortality", "mpbiker_overlays", "MP_MP_Biker_Tat_014_M", "MP_MP_Biker_Tat_014_F", "ZONE_RIGHT_ARM", 8300],
    ["Ride or Die", "mpbiker_overlays", "MP_MP_Biker_Tat_015_M", "MP_MP_Biker_Tat_015_F", "ZONE_LEFT_LEG", 8975],
    ["Macabre Tree", "mpbiker_overlays", "MP_MP_Biker_Tat_016_M", "MP_MP_Biker_Tat_016_F", "ZONE_LEFT_ARM", 9000],
    ["Clawed Beast", "mpbiker_overlays", "MP_MP_Biker_Tat_017_M", "MP_MP_Biker_Tat_017_F", "ZONE_TORSO", 15650],
    ["Skeletal Chopper", "mpbiker_overlays", "MP_MP_Biker_Tat_018_M", "MP_MP_Biker_Tat_018_F", "ZONE_TORSO", 7650],
    ["Gruesome Talons", "mpbiker_overlays", "MP_MP_Biker_Tat_019_M", "MP_MP_Biker_Tat_019_F", "ZONE_TORSO", 9900],
    ["Cranial Rose", "mpbiker_overlays", "MP_MP_Biker_Tat_020_M", "MP_MP_Biker_Tat_020_F", "ZONE_LEFT_ARM", 9745],
    ["Flaming Reaper", "mpbiker_overlays", "MP_MP_Biker_Tat_021_M", "MP_MP_Biker_Tat_021_F", "ZONE_TORSO", 13700],
    ["Western Insignia", "mpbiker_overlays", "MP_MP_Biker_Tat_022_M", "MP_MP_Biker_Tat_022_F", "ZONE_RIGHT_LEG", 9385],
    ["Western MC", "mpbiker_overlays", "MP_MP_Biker_Tat_023_M", "MP_MP_Biker_Tat_023_F", "ZONE_TORSO", 10000],
    ["Live to Ride", "mpbiker_overlays", "MP_MP_Biker_Tat_024_M", "MP_MP_Biker_Tat_024_F", "ZONE_LEFT_ARM", 15320],
    ["Good Luck", "mpbiker_overlays", "MP_MP_Biker_Tat_025_M", "MP_MP_Biker_Tat_025_F", "ZONE_LEFT_ARM", 12950],
    ["American Dream", "mpbiker_overlays", "MP_MP_Biker_Tat_026_M", "MP_MP_Biker_Tat_026_F", "ZONE_TORSO", 11000],
    ["Bad Luck", "mpbiker_overlays", "MP_MP_Biker_Tat_027_M", "MP_MP_Biker_Tat_027_F", "ZONE_LEFT_LEG", 6960],
    ["Dusk Rider", "mpbiker_overlays", "MP_MP_Biker_Tat_028_M", "MP_MP_Biker_Tat_028_F", "ZONE_RIGHT_LEG", 14520],
    ["Bone Wrench", "mpbiker_overlays", "MP_MP_Biker_Tat_029_M", "MP_MP_Biker_Tat_029_F", "ZONE_TORSO", 9630],
    ["Brothers For Life", "mpbiker_overlays", "MP_MP_Biker_Tat_030_M", "MP_MP_Biker_Tat_030_F", "ZONE_TORSO", 9810],
    ["Gear Head", "mpbiker_overlays", "MP_MP_Biker_Tat_031_M", "MP_MP_Biker_Tat_031_F", "ZONE_TORSO", 8600],
    ["Western Eagle", "mpbiker_overlays", "MP_MP_Biker_Tat_032_M", "MP_MP_Biker_Tat_032_F", "ZONE_TORSO", 7655],
    ["Eagle Emblem", "mpbiker_overlays", "MP_MP_Biker_Tat_033_M", "MP_MP_Biker_Tat_033_F", "ZONE_RIGHT_ARM", 4385],
    ["Brotherhood of Bikes", "mpbiker_overlays", "MP_MP_Biker_Tat_034_M", "MP_MP_Biker_Tat_034_F", "ZONE_TORSO", 9975],
    ["Chain Fist", "mpbiker_overlays", "MP_MP_Biker_Tat_035_M", "MP_MP_Biker_Tat_035_F", "ZONE_LEFT_ARM", 5780],
    ["Engulfed Skull", "mpbiker_overlays", "MP_MP_Biker_Tat_036_M", "MP_MP_Biker_Tat_036_F", "ZONE_LEFT_LEG", 9300],
    ["Scorched Soul", "mpbiker_overlays", "MP_MP_Biker_Tat_037_M", "MP_MP_Biker_Tat_037_F", "ZONE_LEFT_LEG", 12495],
    ["FTW", "mpbiker_overlays", "MP_MP_Biker_Tat_038_M", "MP_MP_Biker_Tat_038_F", "ZONE_HEAD", 3900],
    ["Gas Guzzler", "mpbiker_overlays", "MP_MP_Biker_Tat_039_M", "MP_MP_Biker_Tat_039_F", "ZONE_TORSO", 10950],
    ["American Made", "mpbiker_overlays", "MP_MP_Biker_Tat_040_M", "MP_MP_Biker_Tat_040_F", "ZONE_RIGHT_LEG", 13620],
    ["No Regrets", "mpbiker_overlays", "MP_MP_Biker_Tat_041_M", "MP_MP_Biker_Tat_041_F", "ZONE_TORSO", 8320],
    ["Grim Rider", "mpbiker_overlays", "MP_MP_Biker_Tat_042_M", "MP_MP_Biker_Tat_042_F", "ZONE_RIGHT_ARM", 7865],
    ["Ride Forever", "mpbiker_overlays", "MP_MP_Biker_Tat_043_M", "MP_MP_Biker_Tat_043_F", "ZONE_TORSO", 6850],
    ["Ride Free", "mpbiker_overlays", "MP_MP_Biker_Tat_044_M", "MP_MP_Biker_Tat_044_F", "ZONE_LEFT_LEG", 11900],
    ["Ride Hard Die Fast", "mpbiker_overlays", "MP_MP_Biker_Tat_045_M", "MP_MP_Biker_Tat_045_F", "ZONE_LEFT_ARM", 6320],
    ["Skull Chain", "mpbiker_overlays", "MP_MP_Biker_Tat_046_M", "MP_MP_Biker_Tat_046_F", "ZONE_RIGHT_ARM", 4985],
    ["Snake Bike", "mpbiker_overlays", "MP_MP_Biker_Tat_047_M", "MP_MP_Biker_Tat_047_F", "ZONE_RIGHT_ARM", 13500],
    ["STFU", "mpbiker_overlays", "MP_MP_Biker_Tat_048_M", "MP_MP_Biker_Tat_048_F", "ZONE_RIGHT_LEG", 8930],
    ["These Colors Don't Run", "mpbiker_overlays", "MP_MP_Biker_Tat_049_M", "MP_MP_Biker_Tat_049_F", "ZONE_RIGHT_ARM", 8790],
    ["Unforgiven", "mpbiker_overlays", "MP_MP_Biker_Tat_050_M", "MP_MP_Biker_Tat_050_F", "ZONE_TORSO", 8720],
    ["Western Stylized", "mpbiker_overlays", "MP_MP_Biker_Tat_051_M", "MP_MP_Biker_Tat_051_F", "ZONE_HEAD", 4125],
    ["Biker Mount", "mpbiker_overlays", "MP_MP_Biker_Tat_052_M", "MP_MP_Biker_Tat_052_F", "ZONE_TORSO", 9135],
    ["Muffler Helmet", "mpbiker_overlays", "MP_MP_Biker_Tat_053_M", "MP_MP_Biker_Tat_053_F", "ZONE_LEFT_ARM", 8400],
    ["Mum", "mpbiker_overlays", "MP_MP_Biker_Tat_054_M", "MP_MP_Biker_Tat_054_F", "ZONE_RIGHT_ARM", 10450],
    ["Poison Scorpion", "mpbiker_overlays", "MP_MP_Biker_Tat_055_M", "MP_MP_Biker_Tat_055_F", "ZONE_LEFT_ARM", 10995],
    ["Bone Cruiser", "mpbiker_overlays", "MP_MP_Biker_Tat_056_M", "MP_MP_Biker_Tat_056_F", "ZONE_LEFT_LEG", 14960],
    ["Laughing Skull", "mpbiker_overlays", "MP_MP_Biker_Tat_057_M", "MP_MP_Biker_Tat_057_F", "ZONE_LEFT_LEG", 13865],
    ["Reaper Vulture", "mpbiker_overlays", "MP_MP_Biker_Tat_058_M", "MP_MP_Biker_Tat_058_F", "ZONE_TORSO", 7985],
    ["Faggio", "mpbiker_overlays", "MP_MP_Biker_Tat_059_M", "MP_MP_Biker_Tat_059_F", "ZONE_TORSO", 6395],
    ["We Are The Mods!", "mpbiker_overlays", "MP_MP_Biker_Tat_060_M", "MP_MP_Biker_Tat_060_F", "ZONE_TORSO", 7105],
    ["Cash is King", "mpbusiness_overlays", "MP_Buis_M_Neck_000", "", "ZONE_HEAD", 5000],
    ["Bold Dollar Sign", "mpbusiness_overlays", "MP_Buis_M_Neck_001", "", "ZONE_HEAD", 1600],
    ["Script Dollar Sign", "mpbusiness_overlays", "MP_Buis_M_Neck_002", "", "ZONE_HEAD", 1750],
    ["$100", "mpbusiness_overlays", "MP_Buis_M_Neck_003", "", "ZONE_HEAD", 6900],
    ["$100 Bill", "mpbusiness_overlays", "MP_Buis_M_LeftArm_000", "", "ZONE_LEFT_ARM", 3500],
    ["All-Seeing Eye", "mpbusiness_overlays", "MP_Buis_M_LeftArm_001", "", "ZONE_LEFT_ARM", 7300],
    ["Dollar Skull", "mpbusiness_overlays", "MP_Buis_M_RightArm_000", "", "ZONE_RIGHT_ARM", 4800],
    ["Green", "mpbusiness_overlays", "MP_Buis_M_RightArm_001", "", "ZONE_RIGHT_ARM", 1500],
    ["Refined Hustler", "mpbusiness_overlays", "MP_Buis_M_Stomach_000", "", "ZONE_TORSO", 6400],
    ["Rich", "mpbusiness_overlays", "MP_Buis_M_Chest_000", "", "ZONE_TORSO", 3250],
    ["$$$", "mpbusiness_overlays", "MP_Buis_M_Chest_001", "", "ZONE_TORSO", 3500],
    ["Makin' Paper", "mpbusiness_overlays", "MP_Buis_M_Back_000", "", "ZONE_TORSO", 5500],
    ["High Roller", "mpbusiness_overlays", "", "MP_Buis_F_Chest_000", "ZONE_TORSO", 7000],
    ["Makin' Money", "mpbusiness_overlays", "", "MP_Buis_F_Chest_001", "ZONE_TORSO", 7200],
    ["Love Money", "mpbusiness_overlays", "", "MP_Buis_F_Chest_002", "ZONE_TORSO", 1600],
    ["Diamond Back", "mpbusiness_overlays", "", "MP_Buis_F_Stom_000", "ZONE_TORSO", 6800],
    ["Santo Capra Logo", "mpbusiness_overlays", "", "MP_Buis_F_Stom_001", "ZONE_TORSO", 1800],
    ["Money Bag", "mpbusiness_overlays", "", "MP_Buis_F_Stom_002", "ZONE_TORSO", 1500],
    ["Respect", "mpbusiness_overlays", "", "MP_Buis_F_Back_000", "ZONE_TORSO", 4200],
    ["Gold Digger", "mpbusiness_overlays", "", "MP_Buis_F_Back_001", "ZONE_TORSO", 4000],
    ["Val-de-Grace Logo", "mpbusiness_overlays", "", "MP_Buis_F_Neck_000", "ZONE_HEAD", 1900],
    ["Money Rose", "mpbusiness_overlays", "", "MP_Buis_F_Neck_001", "ZONE_HEAD", 2500],
    ["Dollar Sign", "mpbusiness_overlays", "", "MP_Buis_F_RArm_000", "ZONE_RIGHT_ARM", 4900],
    ["Greed is Good", "mpbusiness_overlays", "", "MP_Buis_F_LArm_000", "ZONE_LEFT_ARM", 5500],
    ["Single", "mpbusiness_overlays", "", "MP_Buis_F_LLeg_000", "ZONE_LEFT_LEG", 4850],
    ["Diamond Crown", "mpbusiness_overlays", "", "MP_Buis_F_RLeg_000", "ZONE_RIGHT_LEG", 4500],
    ["Skull Rider", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_000", "MP_Xmas2_F_Tat_000", "ZONE_LEFT_ARM", 5950],
    ["Spider Outline", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_001", "MP_Xmas2_F_Tat_001", "ZONE_LEFT_LEG", 4650],
    ["Spider Color", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_002", "MP_Xmas2_F_Tat_002", "ZONE_LEFT_LEG", 6350],
    ["Snake Outline", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_003", "MP_Xmas2_F_Tat_003", "ZONE_RIGHT_ARM", 8450],
    ["Snake Shaded", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_004", "MP_Xmas2_F_Tat_004", "ZONE_RIGHT_ARM", 13250],
    ["Carp Outline", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_005", "MP_Xmas2_F_Tat_005", "ZONE_TORSO", 8750],
    ["Carp Shaded", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_006", "MP_Xmas2_F_Tat_006", "ZONE_TORSO", 14500],
    ["Los Muertos", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_007", "MP_Xmas2_F_Tat_007", "ZONE_HEAD", 3950],
    ["Death Before Dishonor", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_008", "MP_Xmas2_F_Tat_008", "ZONE_RIGHT_ARM", 4300],
    ["Time To Die", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_009", "MP_Xmas2_F_Tat_009", "ZONE_TORSO", 7800],
    ["Electric Snake", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_010", "MP_Xmas2_F_Tat_010", "ZONE_LEFT_ARM", 6200],
    ["Roaring Tiger", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_011", "MP_Xmas2_F_Tat_011", "ZONE_TORSO", 6850],
    ["8 Ball Skull", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_012", "MP_Xmas2_F_Tat_012", "ZONE_LEFT_ARM", 8250],
    ["Lizard", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_013", "MP_Xmas2_F_Tat_013", "ZONE_TORSO", 7900],
    ["Floral Dagger", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_014", "MP_Xmas2_F_Tat_014", "ZONE_RIGHT_LEG", 10500],
    ["Japanese Warrior", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_015", "MP_Xmas2_F_Tat_015", "ZONE_TORSO", 11000],
    ["Loose Lips Outline", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_016", "MP_Xmas2_F_Tat_016", "ZONE_TORSO", 3150],
    ["Loose Lips Color", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_017", "MP_Xmas2_F_Tat_017", "ZONE_TORSO", 6350],
    ["Royal Dagger Outline", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_018", "MP_Xmas2_F_Tat_018", "ZONE_TORSO", 4300],
    ["Royal Dagger Color", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_019", "MP_Xmas2_F_Tat_019", "ZONE_TORSO", 7500],
    ["Time's Up Outline", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_020", "MP_Xmas2_F_Tat_020", "ZONE_LEFT_ARM", 2500],
    ["Time's Up Color", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_021", "MP_Xmas2_F_Tat_021", "ZONE_LEFT_ARM", 3750],
    ["You're Next Outline", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_022", "MP_Xmas2_F_Tat_022", "ZONE_RIGHT_ARM", 3800],
    ["You're Next Color", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_023", "MP_Xmas2_F_Tat_023", "ZONE_RIGHT_ARM", 5100],
    ["Snake Head Outline", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_024", "MP_Xmas2_F_Tat_024", "ZONE_HEAD", 2100],
    ["Snake Head Color", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_025", "MP_Xmas2_F_Tat_025", "ZONE_HEAD", 4600],
    ["Fuck Luck Outline", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_026", "MP_Xmas2_F_Tat_026", "ZONE_RIGHT_ARM", 1300],
    ["Fuck Luck Color", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_027", "MP_Xmas2_F_Tat_027", "ZONE_RIGHT_ARM", 2200],
    ["Executioner", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_028", "MP_Xmas2_F_Tat_028", "ZONE_TORSO", 5700],
    ["Beautiful Death", "mpchristmas2_overlays", "MP_Xmas2_M_Tat_029", "MP_Xmas2_F_Tat_029", "ZONE_HEAD", 3150],
    ["Bullet Proof", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_000_M", "MP_Gunrunning_Tattoo_000_F", "ZONE_TORSO", 16985],
    ["Crossed Weapons", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_001_M", "MP_Gunrunning_Tattoo_001_F", "ZONE_TORSO", 19355],
    ["Grenade", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_002_M", "MP_Gunrunning_Tattoo_002_F", "ZONE_RIGHT_ARM", 14650],
    ["Lock &amp; Load", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_003_M", "MP_Gunrunning_Tattoo_003_F", "ZONE_HEAD", 8750],
    ["Sidearm", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_004_M", "MP_Gunrunning_Tattoo_004_F", "ZONE_LEFT_ARM", 11285],
    ["Patriot Skull", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_005_M", "MP_Gunrunning_Tattoo_005_F", "ZONE_LEFT_LEG", 9120],
    ["Combat Skull", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_006_M", "MP_Gunrunning_Tattoo_006_F", "ZONE_RIGHT_LEG", 10670],
    ["Stylized Tiger", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_007_M", "MP_Gunrunning_Tattoo_007_F", "ZONE_LEFT_LEG", 9660],
    ["Bandolier", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_008_M", "MP_Gunrunning_Tattoo_008_F", "ZONE_LEFT_ARM", 13445],
    ["Butterfly Knife", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_009_M", "MP_Gunrunning_Tattoo_009_F", "ZONE_TORSO", 14650],
    ["Cash Money", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_010_M", "MP_Gunrunning_Tattoo_010_F", "ZONE_TORSO", 19050],
    ["Death Skull", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_011_M", "MP_Gunrunning_Tattoo_011_F", "ZONE_LEFT_LEG", 9785],
    ["Dollar Daggers", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_012_M", "MP_Gunrunning_Tattoo_012_F", "ZONE_TORSO", 15060],
    ["Wolf Insignia", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_013_M", "MP_Gunrunning_Tattoo_013_F", "ZONE_TORSO", 16115],
    ["Backstabber", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_014_M", "MP_Gunrunning_Tattoo_014_F", "ZONE_TORSO", 17200],
    ["Spiked Skull", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_015_M", "MP_Gunrunning_Tattoo_015_F", "ZONE_LEFT_ARM", 10425],
    ["Blood Money", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_016_M", "MP_Gunrunning_Tattoo_016_F", "ZONE_LEFT_ARM", 10360],
    ["Dog Tags", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_017_M", "MP_Gunrunning_Tattoo_017_F", "ZONE_TORSO", 8980],
    ["Dual Wield Skull", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_018_M", "MP_Gunrunning_Tattoo_018_F", "ZONE_TORSO", 17755],
    ["Pistol Wings", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_019_M", "MP_Gunrunning_Tattoo_019_F", "ZONE_TORSO", 18025],
    ["Crowned Weapons", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_020_M", "MP_Gunrunning_Tattoo_020_F", "ZONE_TORSO", 19875],
    ["Have a Nice Day", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_021_M", "MP_Gunrunning_Tattoo_021_F", "ZONE_RIGHT_ARM", 9460],
    ["Explosive Heart", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_022_M", "MP_Gunrunning_Tattoo_022_F", "ZONE_TORSO", 10825],
    ["Rose Revolver", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_023_M", "MP_Gunrunning_Tattoo_023_F", "ZONE_LEFT_LEG", 8880],
    ["Combat Reaper", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_024_M", "MP_Gunrunning_Tattoo_024_F", "ZONE_RIGHT_ARM", 10340],
    ["Praying Skull", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_025_M", "MP_Gunrunning_Tattoo_025_F", "ZONE_LEFT_ARM", 12150],
    ["Restless Skull", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_026_M", "MP_Gunrunning_Tattoo_026_F", "ZONE_RIGHT_LEG", 11510],
    ["Serpent Revolver", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_027_M", "MP_Gunrunning_Tattoo_027_F", "ZONE_LEFT_ARM", 8420],
    ["Micro SMG Chain", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_028_M", "MP_Gunrunning_Tattoo_028_F", "ZONE_TORSO", 9960],
    ["Win Some Lose Some", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_029_M", "MP_Gunrunning_Tattoo_029_F", "ZONE_TORSO", 14090],
    ["Pistol Ace", "mpgunrunning_overlays", "MP_Gunrunning_Tattoo_030_M", "MP_Gunrunning_Tattoo_030_F", "ZONE_RIGHT_LEG", 11050],
    ["Crossed Arrows", "mphipster_overlays", "FM_Hip_M_Tat_000", "FM_Hip_F_Tat_000", "ZONE_TORSO", 6750],
    ["Single Arrow", "mphipster_overlays", "FM_Hip_M_Tat_001", "FM_Hip_F_Tat_001", "ZONE_RIGHT_ARM", 2000],
    ["Chemistry", "mphipster_overlays", "FM_Hip_M_Tat_002", "FM_Hip_F_Tat_002", "ZONE_TORSO", 2900],
    ["Diamond Sparkle", "mphipster_overlays", "FM_Hip_M_Tat_003", "FM_Hip_F_Tat_003", "ZONE_LEFT_ARM", 2100],
    ["Bone", "mphipster_overlays", "FM_Hip_M_Tat_004", "FM_Hip_F_Tat_004", "ZONE_RIGHT_ARM", 2900],
    ["Beautiful Eye", "mphipster_overlays", "FM_Hip_M_Tat_005", "FM_Hip_F_Tat_005", "ZONE_HEAD", 7450],
    ["Feather Birds", "mphipster_overlays", "FM_Hip_M_Tat_006", "FM_Hip_F_Tat_006", "ZONE_TORSO", 4550],
    ["Bricks", "mphipster_overlays", "FM_Hip_M_Tat_007", "FM_Hip_F_Tat_007", "ZONE_LEFT_ARM", 6000],
    ["Cube", "mphipster_overlays", "FM_Hip_M_Tat_008", "FM_Hip_F_Tat_008", "ZONE_RIGHT_ARM", 4850],
    ["Squares", "mphipster_overlays", "FM_Hip_M_Tat_009", "FM_Hip_F_Tat_009", "ZONE_LEFT_LEG", 4000],
    ["Horseshoe", "mphipster_overlays", "FM_Hip_M_Tat_010", "FM_Hip_F_Tat_010", "ZONE_RIGHT_ARM", 3150],
    ["Infinity", "mphipster_overlays", "FM_Hip_M_Tat_011", "FM_Hip_F_Tat_011", "ZONE_TORSO", 3000],
    ["Antlers", "mphipster_overlays", "FM_Hip_M_Tat_012", "FM_Hip_F_Tat_012", "ZONE_TORSO", 6500],
    ["Boombox", "mphipster_overlays", "FM_Hip_M_Tat_013", "FM_Hip_F_Tat_013", "ZONE_TORSO", 6950],
    ["Spray Can", "mphipster_overlays", "FM_Hip_M_Tat_014", "FM_Hip_F_Tat_014", "ZONE_RIGHT_ARM", 4300],
    ["Mustache", "mphipster_overlays", "FM_Hip_M_Tat_015", "FM_Hip_F_Tat_015", "ZONE_LEFT_ARM", 3400],
    ["Lightning Bolt", "mphipster_overlays", "FM_Hip_M_Tat_016", "FM_Hip_F_Tat_016", "ZONE_LEFT_ARM", 3700],
    ["Eye Triangle", "mphipster_overlays", "FM_Hip_M_Tat_017", "FM_Hip_F_Tat_017", "ZONE_RIGHT_ARM", 2650],
    ["Origami", "mphipster_overlays", "FM_Hip_M_Tat_018", "FM_Hip_F_Tat_018", "ZONE_RIGHT_ARM", 1800],
    ["Charm", "mphipster_overlays", "FM_Hip_M_Tat_019", "FM_Hip_F_Tat_019", "ZONE_LEFT_LEG", 3400],
    ["Geo Pattern", "mphipster_overlays", "FM_Hip_M_Tat_020", "FM_Hip_F_Tat_020", "ZONE_RIGHT_ARM", 7350],
    ["Geo Fox", "mphipster_overlays", "FM_Hip_M_Tat_021", "FM_Hip_F_Tat_021", "ZONE_HEAD", 7850],
    ["Pencil", "mphipster_overlays", "FM_Hip_M_Tat_022", "FM_Hip_F_Tat_022", "ZONE_RIGHT_ARM", 2250],
    ["Smiley", "mphipster_overlays", "FM_Hip_M_Tat_023", "FM_Hip_F_Tat_023", "ZONE_RIGHT_ARM", 7000],
    ["Pyramid", "mphipster_overlays", "FM_Hip_M_Tat_024", "FM_Hip_F_Tat_024", "ZONE_TORSO", 2950],
    ["Watch Your Step", "mphipster_overlays", "FM_Hip_M_Tat_025", "FM_Hip_F_Tat_025", "ZONE_TORSO", 3500],
    ["Pizza", "mphipster_overlays", "FM_Hip_M_Tat_026", "FM_Hip_F_Tat_026", "ZONE_LEFT_ARM", 2400],
    ["Padlock", "mphipster_overlays", "FM_Hip_M_Tat_027", "FM_Hip_F_Tat_027", "ZONE_LEFT_ARM", 5750],
    ["Thorny Rose", "mphipster_overlays", "FM_Hip_M_Tat_028", "FM_Hip_F_Tat_028", "ZONE_LEFT_ARM", 4800],
    ["Sad", "mphipster_overlays", "FM_Hip_M_Tat_029", "FM_Hip_F_Tat_029", "ZONE_TORSO", 1850],
    ["Shark Fin", "mphipster_overlays", "FM_Hip_M_Tat_030", "FM_Hip_F_Tat_030", "ZONE_TORSO", 2250],
    ["Skateboard", "mphipster_overlays", "FM_Hip_M_Tat_031", "FM_Hip_F_Tat_031", "ZONE_TORSO", 4950],
    ["Paper Plane", "mphipster_overlays", "FM_Hip_M_Tat_032", "FM_Hip_F_Tat_032", "ZONE_TORSO", 4350],
    ["Stag", "mphipster_overlays", "FM_Hip_M_Tat_033", "FM_Hip_F_Tat_033", "ZONE_TORSO", 6950],
    ["Stop", "mphipster_overlays", "FM_Hip_M_Tat_034", "FM_Hip_F_Tat_034", "ZONE_LEFT_ARM", 9500],
    ["Sewn Heart", "mphipster_overlays", "FM_Hip_M_Tat_035", "FM_Hip_F_Tat_035", "ZONE_TORSO", 7500],
    ["Shapes", "mphipster_overlays", "FM_Hip_M_Tat_036", "FM_Hip_F_Tat_036", "ZONE_RIGHT_ARM", 5150],
    ["Sunrise", "mphipster_overlays", "FM_Hip_M_Tat_037", "FM_Hip_F_Tat_037", "ZONE_LEFT_ARM", 3750],
    ["Grub", "mphipster_overlays", "FM_Hip_M_Tat_038", "FM_Hip_F_Tat_038", "ZONE_RIGHT_LEG", 3500],
    ["Sleeve", "mphipster_overlays", "FM_Hip_M_Tat_039", "FM_Hip_F_Tat_039", "ZONE_LEFT_ARM", 10000],
    ["Black Anchor", "mphipster_overlays", "FM_Hip_M_Tat_040", "FM_Hip_F_Tat_040", "ZONE_LEFT_LEG", 2950],
    ["Tooth", "mphipster_overlays", "FM_Hip_M_Tat_041", "FM_Hip_F_Tat_041", "ZONE_TORSO", 2575],
    ["Sparkplug", "mphipster_overlays", "FM_Hip_M_Tat_042", "FM_Hip_F_Tat_042", "ZONE_RIGHT_LEG", 4300],
    ["Triangle White", "mphipster_overlays", "FM_Hip_M_Tat_043", "FM_Hip_F_Tat_043", "ZONE_LEFT_ARM", 5500],
    ["Triangle Black", "mphipster_overlays", "FM_Hip_M_Tat_044", "FM_Hip_F_Tat_044", "ZONE_RIGHT_ARM", 5500],
    ["Mesh Band", "mphipster_overlays", "FM_Hip_M_Tat_045", "FM_Hip_F_Tat_045", "ZONE_RIGHT_ARM", 4000],
    ["Triangles", "mphipster_overlays", "FM_Hip_M_Tat_046", "FM_Hip_F_Tat_046", "ZONE_TORSO", 3750],
    ["Cassette", "mphipster_overlays", "FM_Hip_M_Tat_047", "FM_Hip_F_Tat_047", "ZONE_TORSO", 1900],
    ["Peace", "mphipster_overlays", "FM_Hip_M_Tat_048", "FM_Hip_F_Tat_048", "ZONE_LEFT_ARM", 7850],
    ["Block Back", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_000_M", "MP_MP_ImportExport_Tat_000_F", "ZONE_TORSO", 13780],
    ["Power Plant", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_001_M", "MP_MP_ImportExport_Tat_001_F", "ZONE_TORSO", 12900],
    ["Tuned to Death", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_002_M", "MP_MP_ImportExport_Tat_002_F", "ZONE_TORSO", 12120],
    ["Mechanical Sleeve", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_003_M", "MP_MP_ImportExport_Tat_003_F", "ZONE_RIGHT_ARM", 17200],
    ["Piston Sleeve", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_004_M", "MP_MP_ImportExport_Tat_004_F", "ZONE_LEFT_ARM", 16350],
    ["Dialed In", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_005_M", "MP_MP_ImportExport_Tat_005_F", "ZONE_RIGHT_ARM", 18615],
    ["Engulfed Block", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_006_M", "MP_MP_ImportExport_Tat_006_F", "ZONE_RIGHT_ARM", 15720],
    ["Drive Forever", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_007_M", "MP_MP_ImportExport_Tat_007_F", "ZONE_RIGHT_ARM", 16685],
    ["Scarlett", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_008_M", "MP_MP_ImportExport_Tat_008_F", "ZONE_LEFT_ARM", 19900],
    ["Serpents of Destruction", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_009_M", "MP_MP_ImportExport_Tat_009_F", "ZONE_TORSO", 16500],
    ["Take the Wheel", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_010_M", "MP_MP_ImportExport_Tat_010_F", "ZONE_TORSO", 14235],
    ["Talk Shit Get Hit", "mpimportexport_overlays", "MP_MP_ImportExport_Tat_011_M", "MP_MP_ImportExport_Tat_011_F", "ZONE_TORSO", 15985],
    ["King Fight", "mplowrider_overlays", "MP_LR_Tat_001_M", "MP_LR_Tat_001_F", "ZONE_TORSO", 6100],
    ["Holy Mary", "mplowrider_overlays", "MP_LR_Tat_002_M", "MP_LR_Tat_002_F", "ZONE_TORSO", 10250],
    ["Gun Mic", "mplowrider_overlays", "MP_LR_Tat_004_M", "MP_LR_Tat_004_F", "ZONE_TORSO", 3500],
    ["No Evil", "mplowrider_overlays", "MP_LR_Tat_005_M", "MP_LR_Tat_005_F", "ZONE_LEFT_ARM", 5900],
    ["LS Serpent", "mplowrider_overlays", "MP_LR_Tat_007_M", "MP_LR_Tat_007_F", "ZONE_LEFT_LEG", 5500],
    ["Amazon", "mplowrider_overlays", "MP_LR_Tat_009_M", "MP_LR_Tat_009_F", "ZONE_TORSO", 9500],
    ["Bad Angel", "mplowrider_overlays", "MP_LR_Tat_010_M", "MP_LR_Tat_010_F", "ZONE_TORSO", 16500],
    ["Love Gamble", "mplowrider_overlays", "MP_LR_Tat_013_M", "MP_LR_Tat_013_F", "ZONE_TORSO", 8300],
    ["Love is Blind", "mplowrider_overlays", "MP_LR_Tat_014_M", "MP_LR_Tat_014_F", "ZONE_TORSO", 17750],
    ["Seductress", "mplowrider_overlays", "MP_LR_Tat_015_M", "MP_LR_Tat_015_F", "ZONE_RIGHT_ARM", 6150],
    ["Ink Me", "mplowrider_overlays", "MP_LR_Tat_017_M", "MP_LR_Tat_017_F", "ZONE_RIGHT_LEG", 7700],
    ["Presidents", "mplowrider_overlays", "MP_LR_Tat_020_M", "MP_LR_Tat_020_F", "ZONE_LEFT_LEG", 6850],
    ["Sad Angel", "mplowrider_overlays", "MP_LR_Tat_021_M", "MP_LR_Tat_021_F", "ZONE_TORSO", 15000],
    ["Dance of Hearts", "mplowrider_overlays", "MP_LR_Tat_023_M", "MP_LR_Tat_023_F", "ZONE_RIGHT_LEG", 6500],
    ["Royal Takeover", "mplowrider_overlays", "MP_LR_Tat_026_M", "MP_LR_Tat_026_F", "ZONE_TORSO", 7400],
    ["Los Santos Life", "mplowrider_overlays", "MP_LR_Tat_027_M", "MP_LR_Tat_027_F", "ZONE_LEFT_ARM", 7800],
    ["City Sorrow", "mplowrider_overlays", "MP_LR_Tat_033_M", "MP_LR_Tat_033_F", "ZONE_LEFT_ARM", 10000],
    ["SA Assault", "mplowrider2_overlays", "MP_LR_Tat_000_M", "MP_LR_Tat_000_F", "ZONE_TORSO", 19000],
    ["Lady Vamp", "mplowrider2_overlays", "MP_LR_Tat_003_M", "MP_LR_Tat_003_F", "ZONE_RIGHT_ARM", 5950],
    ["Love Hustle", "mplowrider2_overlays", "MP_LR_Tat_006_M", "MP_LR_Tat_006_F", "ZONE_LEFT_ARM", 7450],
    ["Love the Game", "mplowrider2_overlays", "MP_LR_Tat_008_M", "MP_LR_Tat_008_F", "ZONE_TORSO", 18750],
    ["Lady Liberty", "mplowrider2_overlays", "MP_LR_Tat_011_M", "MP_LR_Tat_011_F", "ZONE_TORSO", 8000],
    ["Royal Kiss", "mplowrider2_overlays", "MP_LR_Tat_012_M", "MP_LR_Tat_012_F", "ZONE_TORSO", 7650],
    ["Two Face", "mplowrider2_overlays", "MP_LR_Tat_016_M", "MP_LR_Tat_016_F", "ZONE_TORSO", 6400],
    ["Skeleton Party", "mplowrider2_overlays", "MP_LR_Tat_018_M", "MP_LR_Tat_018_F", "ZONE_LEFT_ARM", 11000],
    ["Death Behind", "mplowrider2_overlays", "MP_LR_Tat_019_M", "MP_LR_Tat_019_F", "ZONE_TORSO", 9750],
    ["My Crazy Life", "mplowrider2_overlays", "MP_LR_Tat_022_M", "MP_LR_Tat_022_F", "ZONE_LEFT_ARM", 7350],
    ["Loving Los Muertos", "mplowrider2_overlays", "MP_LR_Tat_028_M", "MP_LR_Tat_028_F", "ZONE_RIGHT_ARM", 8800],
    ["Death Us Do Part", "mplowrider2_overlays", "MP_LR_Tat_029_M", "MP_LR_Tat_029_F", "ZONE_LEFT_LEG", 6250],
    ["San Andreas Prayer", "mplowrider2_overlays", "MP_LR_Tat_030_M", "MP_LR_Tat_030_F", "ZONE_RIGHT_LEG", 8150],
    ["Dead Pretty", "mplowrider2_overlays", "MP_LR_Tat_031_M", "MP_LR_Tat_031_F", "ZONE_TORSO", 16500],
    ["Reign Over", "mplowrider2_overlays", "MP_LR_Tat_032_M", "MP_LR_Tat_032_F", "ZONE_TORSO", 18500],
    ["Black Tears", "mplowrider2_overlays", "MP_LR_Tat_035_M", "MP_LR_Tat_035_F", "ZONE_RIGHT_ARM", 8250],
    ["Serpent of Death", "mpluxe_overlays", "MP_LUXE_TAT_000_M", "MP_LUXE_TAT_000_F", "ZONE_LEFT_LEG", 11900],
    ["Elaborate Los Muertos", "mpluxe_overlays", "MP_LUXE_TAT_001_M", "MP_LUXE_TAT_001_F", "ZONE_RIGHT_LEG", 14350],
    ["Abstract Skull", "mpluxe_overlays", "MP_LUXE_TAT_003_M", "MP_LUXE_TAT_003_F", "ZONE_TORSO", 8350],
    ["Floral Raven", "mpluxe_overlays", "MP_LUXE_TAT_004_M", "MP_LUXE_TAT_004_F", "ZONE_RIGHT_ARM", 12200],
    ["Adorned Wolf", "mpluxe_overlays", "MP_LUXE_TAT_006_M", "MP_LUXE_TAT_006_F", "ZONE_TORSO", 25000],
    ["Eye of the Griffin", "mpluxe_overlays", "MP_LUXE_TAT_007_M", "MP_LUXE_TAT_007_F", "ZONE_TORSO", 12450],
    ["Flying Eye", "mpluxe_overlays", "MP_LUXE_TAT_008_M", "MP_LUXE_TAT_008_F", "ZONE_TORSO", 18000],
    ["Floral Symmetry", "mpluxe_overlays", "MP_LUXE_TAT_009_M", "MP_LUXE_TAT_009_F", "ZONE_LEFT_ARM", 19150],
    ["Mermaid Harpist", "mpluxe_overlays", "MP_LUXE_TAT_013_M", "MP_LUXE_TAT_013_F", "ZONE_RIGHT_ARM", 16900],
    ["Ancient Queen", "mpluxe_overlays", "MP_LUXE_TAT_014_M", "MP_LUXE_TAT_014_F", "ZONE_TORSO", 18200],
    ["Smoking Sisters", "mpluxe_overlays", "MP_LUXE_TAT_015_M", "MP_LUXE_TAT_015_F", "ZONE_TORSO", 16250],
    ["Geisha Bloom", "mpluxe_overlays", "MP_LUXE_TAT_019_M", "MP_LUXE_TAT_019_F", "ZONE_RIGHT_ARM", 16850],
    ["Archangel &amp; Mary", "mpluxe_overlays", "MP_LUXE_TAT_020_M", "MP_LUXE_TAT_020_F", "ZONE_LEFT_ARM", 22500],
    ["Gabriel", "mpluxe_overlays", "MP_LUXE_TAT_021_M", "MP_LUXE_TAT_021_F", "ZONE_LEFT_ARM", 12850],
    ["Feather Mural", "mpluxe_overlays", "MP_LUXE_TAT_024_M", "MP_LUXE_TAT_024_F", "ZONE_TORSO", 27250],
    ["The Howler", "mpluxe2_overlays", "MP_LUXE_TAT_002_M", "MP_LUXE_TAT_002_F", "ZONE_TORSO", 11000],
    ["Fatal Dagger", "mpluxe2_overlays", "MP_LUXE_TAT_005_M", "MP_LUXE_TAT_005_F", "ZONE_LEFT_ARM", 10250],
    ["Intrometric", "mpluxe2_overlays", "MP_LUXE_TAT_010_M", "MP_LUXE_TAT_010_F", "ZONE_RIGHT_ARM", 14650],
    ["Cross of Roses", "mpluxe2_overlays", "MP_LUXE_TAT_011_M", "MP_LUXE_TAT_011_F", "ZONE_LEFT_LEG", 13250],
    ["Geometric Galaxy", "mpluxe2_overlays", "MP_LUXE_TAT_012_M", "MP_LUXE_TAT_012_F", "ZONE_TORSO", 26500],
    ["Egyptian Mural", "mpluxe2_overlays", "MP_LUXE_TAT_016_M", "MP_LUXE_TAT_016_F", "ZONE_LEFT_ARM", 18600],
    ["Heavenly Deity", "mpluxe2_overlays", "MP_LUXE_TAT_017_M", "MP_LUXE_TAT_017_F", "ZONE_RIGHT_ARM", 21550],
    ["Divine Goddess", "mpluxe2_overlays", "MP_LUXE_TAT_018_M", "MP_LUXE_TAT_018_F", "ZONE_LEFT_ARM", 23400],
    ["Cloaked Angel", "mpluxe2_overlays", "MP_LUXE_TAT_022_M", "MP_LUXE_TAT_022_F", "ZONE_TORSO", 28500],
    ["Starmetric", "mpluxe2_overlays", "MP_LUXE_TAT_023_M", "MP_LUXE_TAT_023_F", "ZONE_RIGHT_LEG", 15600],
    ["Reaper Sway", "mpluxe2_overlays", "MP_LUXE_TAT_025_M", "MP_LUXE_TAT_025_F", "ZONE_TORSO", 11500],
    ["Floral Print", "mpluxe2_overlays", "MP_LUXE_TAT_026_M", "MP_LUXE_TAT_026_F", "ZONE_RIGHT_ARM", 14700],
    ["Cobra Dawn", "mpluxe2_overlays", "MP_LUXE_TAT_027_M", "MP_LUXE_TAT_027_F", "ZONE_TORSO", 12750],
    ["Python Skull", "mpluxe2_overlays", "MP_LUXE_TAT_028_M", "MP_LUXE_TAT_028_F", "ZONE_LEFT_ARM", 11300],
    ["Geometric Design", "mpluxe2_overlays", "MP_LUXE_TAT_029_M", "MP_LUXE_TAT_029_F", "ZONE_TORSO", 30000],
    ["Geometric Design", "mpluxe2_overlays", "MP_LUXE_TAT_030_M", "MP_LUXE_TAT_030_F", "ZONE_RIGHT_ARM", 8000],
    ["Geometric Design", "mpluxe2_overlays", "MP_LUXE_TAT_031_M", "MP_LUXE_TAT_031_F", "ZONE_LEFT_ARM", 8000],
    ["Bless The Dead", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_000_M", "MP_Smuggler_Tattoo_000_F", "ZONE_TORSO", 11270],
    ["Crackshot", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_001_M", "MP_Smuggler_Tattoo_001_F", "ZONE_RIGHT_ARM", 10825],
    ["Dead Lies", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_002_M", "MP_Smuggler_Tattoo_002_F", "ZONE_TORSO", 12430],
    ["Give Nothing Back", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_003_M", "MP_Smuggler_Tattoo_003_F", "ZONE_TORSO", 13090],
    ["Honor", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_004_M", "MP_Smuggler_Tattoo_004_F", "ZONE_LEFT_ARM", 8150],
    ["Mutiny", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_005_M", "MP_Smuggler_Tattoo_005_F", "ZONE_RIGHT_ARM", 7920],
    ["Never Surrender", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_006_M", "MP_Smuggler_Tattoo_006_F", "ZONE_TORSO", 9475],
    ["No Honor", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_007_M", "MP_Smuggler_Tattoo_007_F", "ZONE_TORSO", 8525],
    ["Horrors Of The Deep", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_008_M", "MP_Smuggler_Tattoo_008_F", "ZONE_LEFT_ARM", 11045],
    ["Tall Ship Conflict", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_009_M", "MP_Smuggler_Tattoo_009_F", "ZONE_TORSO", 16625],
    ["See You In Hell", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_010_M", "MP_Smuggler_Tattoo_010_F", "ZONE_TORSO", 12815],
    ["Sinner", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_011_M", "MP_Smuggler_Tattoo_011_F", "ZONE_HEAD", 8110],
    ["Thief", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_012_M", "MP_Smuggler_Tattoo_012_F", "ZONE_HEAD", 10720],
    ["Torn Wings", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_013_M", "MP_Smuggler_Tattoo_013_F", "ZONE_TORSO", 10540],
    ["Mermaid's Curse", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_014_M", "MP_Smuggler_Tattoo_014_F", "ZONE_LEFT_ARM", 8825],
    ["Jolly Roger", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_015_M", "MP_Smuggler_Tattoo_015_F", "ZONE_TORSO", 9765],
    ["Skull Compass", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_016_M", "MP_Smuggler_Tattoo_016_F", "ZONE_TORSO", 13790],
    ["Framed Tall Ship", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_017_M", "MP_Smuggler_Tattoo_017_F", "ZONE_TORSO", 18850],
    ["Finders Keepers", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_018_M", "MP_Smuggler_Tattoo_018_F", "ZONE_TORSO", 16990],
    ["Lost At Sea", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_019_M", "MP_Smuggler_Tattoo_019_F", "ZONE_TORSO", 11105],
    ["Homeward Bound", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_020_M", "MP_Smuggler_Tattoo_020_F", "ZONE_RIGHT_LEG", 9155],
    ["Dead Tales", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_021_M", "MP_Smuggler_Tattoo_021_F", "ZONE_TORSO", 14860],
    ["X Marks The Spot", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_022_M", "MP_Smuggler_Tattoo_022_F", "ZONE_TORSO", 16710],
    ["Stylized Kraken", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_023_M", "MP_Smuggler_Tattoo_023_F", "ZONE_RIGHT_ARM", 14400],
    ["Pirate Captain", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_024_M", "MP_Smuggler_Tattoo_024_F", "ZONE_TORSO", 18210],
    ["Claimed By The Beast", "mpsmuggler_overlays", "MP_Smuggler_Tattoo_025_M", "MP_Smuggler_Tattoo_025_F", "ZONE_TORSO", 17450],
    ["Stunt Skull", "mpstunt_overlays", "MP_MP_Stunt_Tat_000_M", "MP_MP_Stunt_Tat_000_F", "ZONE_HEAD", 4850],
    ["8 Eyed Skull", "mpstunt_overlays", "MP_MP_Stunt_tat_001_M", "MP_MP_Stunt_tat_001_F", "ZONE_LEFT_ARM", 11600],
    ["Big Cat", "mpstunt_overlays", "MP_MP_Stunt_tat_002_M", "MP_MP_Stunt_tat_002_F", "ZONE_LEFT_ARM", 8850],
    ["Poison Wrench", "mpstunt_overlays", "MP_MP_Stunt_tat_003_M", "MP_MP_Stunt_tat_003_F", "ZONE_RIGHT_ARM", 4300],
    ["Scorpion", "mpstunt_overlays", "MP_MP_Stunt_tat_004_M", "MP_MP_Stunt_tat_004_F", "ZONE_HEAD", 6350],
    ["Demon Spark Plug", "mpstunt_overlays", "MP_MP_Stunt_tat_005_M", "MP_MP_Stunt_tat_005_F", "ZONE_RIGHT_LEG", 8850],
    ["Toxic Spider", "mpstunt_overlays", "MP_MP_Stunt_tat_006_M", "MP_MP_Stunt_tat_006_F", "ZONE_HEAD", 5900],
    ["Dagger Devil", "mpstunt_overlays", "MP_MP_Stunt_tat_007_M", "MP_MP_Stunt_tat_007_F", "ZONE_LEFT_LEG", 8150],
    ["Moonlight Ride", "mpstunt_overlays", "MP_MP_Stunt_tat_008_M", "MP_MP_Stunt_tat_008_F", "ZONE_LEFT_ARM", 14750],
    ["Arachnid of Death", "mpstunt_overlays", "MP_MP_Stunt_tat_009_M", "MP_MP_Stunt_tat_009_F", "ZONE_RIGHT_ARM", 10800],
    ["Grave Vulture", "mpstunt_overlays", "MP_MP_Stunt_tat_010_M", "MP_MP_Stunt_tat_010_F", "ZONE_RIGHT_ARM", 11000],
    ["Wheels of Death", "mpstunt_overlays", "MP_MP_Stunt_tat_011_M", "MP_MP_Stunt_tat_011_F", "ZONE_TORSO", 10750],
    ["Punk Biker", "mpstunt_overlays", "MP_MP_Stunt_tat_012_M", "MP_MP_Stunt_tat_012_F", "ZONE_TORSO", 11950],
    ["Dirt Track Hero", "mpstunt_overlays", "MP_MP_Stunt_tat_013_M", "MP_MP_Stunt_tat_013_F", "ZONE_LEFT_LEG", 15500],
    ["Bat Cat of Spades", "mpstunt_overlays", "MP_MP_Stunt_tat_014_M", "MP_MP_Stunt_tat_014_F", "ZONE_TORSO", 8300],
    ["Praying Gloves", "mpstunt_overlays", "MP_MP_Stunt_tat_015_M", "MP_MP_Stunt_tat_015_F", "ZONE_RIGHT_LEG", 13400],
    ["Coffin Racer", "mpstunt_overlays", "MP_MP_Stunt_tat_016_M", "MP_MP_Stunt_tat_016_F", "ZONE_RIGHT_ARM", 12950],
    ["Bat Wheel", "mpstunt_overlays", "MP_MP_Stunt_tat_017_M", "MP_MP_Stunt_tat_017_F", "ZONE_HEAD", 3800],
    ["Vintage Bully", "mpstunt_overlays", "MP_MP_Stunt_tat_018_M", "MP_MP_Stunt_tat_018_F", "ZONE_TORSO", 5400],
    ["Engine Heart", "mpstunt_overlays", "MP_MP_Stunt_tat_019_M", "MP_MP_Stunt_tat_019_F", "ZONE_TORSO", 8900],
    ["Piston Angel", "mpstunt_overlays", "MP_MP_Stunt_tat_020_M", "MP_MP_Stunt_tat_020_F", "ZONE_RIGHT_LEG", 6950],
    ["Golden Cobra", "mpstunt_overlays", "MP_MP_Stunt_tat_021_M", "MP_MP_Stunt_tat_021_F", "ZONE_LEFT_LEG", 21200],
    ["Piston Head", "mpstunt_overlays", "MP_MP_Stunt_tat_022_M", "MP_MP_Stunt_tat_022_F", "ZONE_LEFT_ARM", 16850],
    ["Tanked", "mpstunt_overlays", "MP_MP_Stunt_tat_023_M", "MP_MP_Stunt_tat_023_F", "ZONE_LEFT_ARM", 18500],
    ["Road Kill", "mpstunt_overlays", "MP_MP_Stunt_tat_024_M", "MP_MP_Stunt_tat_024_F", "ZONE_TORSO", 8650],
    ["Speed Freak", "mpstunt_overlays", "MP_MP_Stunt_tat_025_M", "MP_MP_Stunt_tat_025_F", "ZONE_RIGHT_LEG", 7200],
    ["Winged Wheel", "mpstunt_overlays", "MP_MP_Stunt_tat_026_M", "MP_MP_Stunt_tat_026_F", "ZONE_TORSO", 12300],
    ["Punk Road Hog", "mpstunt_overlays", "MP_MP_Stunt_tat_027_M", "MP_MP_Stunt_tat_027_F", "ZONE_TORSO", 8950],
    ["Quad Goblin", "mpstunt_overlays", "MP_MP_Stunt_tat_028_M", "MP_MP_Stunt_tat_028_F", "ZONE_LEFT_LEG", 9850],
    ["Majestic Finish", "mpstunt_overlays", "MP_MP_Stunt_tat_029_M", "MP_MP_Stunt_tat_029_F", "ZONE_TORSO", 17350],
    ["Man's Ruin", "mpstunt_overlays", "MP_MP_Stunt_tat_030_M", "MP_MP_Stunt_tat_030_F", "ZONE_TORSO", 8150],
    ["Stunt Jesus", "mpstunt_overlays", "MP_MP_Stunt_tat_031_M", "MP_MP_Stunt_tat_031_F", "ZONE_LEFT_LEG", 11000],
    ["Wheelie Mouse", "mpstunt_overlays", "MP_MP_Stunt_tat_032_M", "MP_MP_Stunt_tat_032_F", "ZONE_RIGHT_LEG", 10350],
    ["Sugar Skull Trucker", "mpstunt_overlays", "MP_MP_Stunt_tat_033_M", "MP_MP_Stunt_tat_033_F", "ZONE_TORSO", 10400],
    ["Feather Road Kill", "mpstunt_overlays", "MP_MP_Stunt_tat_034_M", "MP_MP_Stunt_tat_034_F", "ZONE_TORSO", 9900],
    ["Stuntman's End", "mpstunt_overlays", "MP_MP_Stunt_tat_035_M", "MP_MP_Stunt_tat_035_F", "ZONE_LEFT_ARM", 12700],
    ["Biker Stallion", "mpstunt_overlays", "MP_MP_Stunt_tat_036_M", "MP_MP_Stunt_tat_036_F", "ZONE_RIGHT_ARM", 2350],
    ["Big Grills", "mpstunt_overlays", "MP_MP_Stunt_tat_037_M", "MP_MP_Stunt_tat_037_F", "ZONE_TORSO", 6850],
    ["One Down Five Up", "mpstunt_overlays", "MP_MP_Stunt_tat_038_M", "MP_MP_Stunt_tat_038_F", "ZONE_RIGHT_ARM", 5750],
    ["Kaboom", "mpstunt_overlays", "MP_MP_Stunt_tat_039_M", "MP_MP_Stunt_tat_039_F", "ZONE_LEFT_ARM", 9350],
    ["Monkey Chopper", "mpstunt_overlays", "MP_MP_Stunt_tat_040_M", "MP_MP_Stunt_tat_040_F", "ZONE_TORSO", 15950],
    ["Brapp", "mpstunt_overlays", "MP_MP_Stunt_tat_041_M", "MP_MP_Stunt_tat_041_F", "ZONE_TORSO", 10100],
    ["Flaming Quad", "mpstunt_overlays", "MP_MP_Stunt_tat_042_M", "MP_MP_Stunt_tat_042_F", "ZONE_HEAD", 4150],
    ["Engine Arm", "mpstunt_overlays", "MP_MP_Stunt_tat_043_M", "MP_MP_Stunt_tat_043_F", "ZONE_LEFT_ARM", 10300],
    ["Ram Skull", "mpstunt_overlays", "MP_MP_Stunt_tat_044_M", "MP_MP_Stunt_tat_044_F", "ZONE_TORSO", 13900],
    ["Severed Hand", "mpstunt_overlays", "MP_MP_Stunt_tat_045_M", "MP_MP_Stunt_tat_045_F", "ZONE_RIGHT_LEG", 19650],
    ["Full Throttle", "mpstunt_overlays", "MP_MP_Stunt_tat_046_M", "MP_MP_Stunt_tat_046_F", "ZONE_TORSO", 12750],
    ["Brake Knife", "mpstunt_overlays", "MP_MP_Stunt_tat_047_M", "MP_MP_Stunt_tat_047_F", "ZONE_RIGHT_LEG", 9200],
    ["Racing Doll", "mpstunt_overlays", "MP_MP_Stunt_tat_048_M", "MP_MP_Stunt_tat_048_F", "ZONE_TORSO", 11300],
    ["Seductive Mechanic", "mpstunt_overlays", "MP_MP_Stunt_tat_049_M", "MP_MP_Stunt_tat_049_F", "ZONE_RIGHT_ARM", 23000],
    ["Skull", "multiplayer_overlays", "FM_Tat_Award_M_000", "FM_Tat_Award_F_000", "ZONE_HEAD", 20000],
    ["Burning Heart", "multiplayer_overlays", "FM_Tat_Award_M_001", "FM_Tat_Award_F_001", "ZONE_LEFT_ARM", 1400],
    ["Grim Reaper Smoking Gun", "multiplayer_overlays", "FM_Tat_Award_M_002", "FM_Tat_Award_F_002", "ZONE_RIGHT_ARM", 9750],
    ["Blackjack", "multiplayer_overlays", "FM_Tat_Award_M_003", "FM_Tat_Award_F_003", "ZONE_TORSO", 2150],
    ["Hustler", "multiplayer_overlays", "FM_Tat_Award_M_004", "FM_Tat_Award_F_004", "ZONE_TORSO", 10000],
    ["Angel", "multiplayer_overlays", "FM_Tat_Award_M_005", "FM_Tat_Award_F_005", "ZONE_TORSO", 12400],
    ["Skull and Sword", "multiplayer_overlays", "FM_Tat_Award_M_006", "FM_Tat_Award_F_006", "ZONE_RIGHT_LEG", 3500],
    ["Racing Blonde", "multiplayer_overlays", "FM_Tat_Award_M_007", "FM_Tat_Award_F_007", "ZONE_LEFT_ARM", 4950],
    ["Los Santos Customs", "multiplayer_overlays", "FM_Tat_Award_M_008", "FM_Tat_Award_F_008", "ZONE_TORSO", 1350],
    ["Dragon and Dagger", "multiplayer_overlays", "FM_Tat_Award_M_009", "FM_Tat_Award_F_009", "ZONE_LEFT_LEG", 1450],
    ["Ride or Die", "multiplayer_overlays", "FM_Tat_Award_M_010", "FM_Tat_Award_F_010", "ZONE_RIGHT_ARM", 2700],
    ["Blank Scroll", "multiplayer_overlays", "FM_Tat_Award_M_011", "FM_Tat_Award_F_011", "ZONE_TORSO", 1200],
    ["Embellished Scroll", "multiplayer_overlays", "FM_Tat_Award_M_012", "FM_Tat_Award_F_012", "ZONE_TORSO", 1500],
    ["Seven Deadly Sins", "multiplayer_overlays", "FM_Tat_Award_M_013", "FM_Tat_Award_F_013", "ZONE_TORSO", 2650],
    ["Trust No One", "multiplayer_overlays", "FM_Tat_Award_M_014", "FM_Tat_Award_F_014", "ZONE_TORSO", 1900],
    ["Racing Brunette", "multiplayer_overlays", "FM_Tat_Award_M_015", "FM_Tat_Award_F_015", "ZONE_LEFT_ARM", 4950],
    ["Clown", "multiplayer_overlays", "FM_Tat_Award_M_016", "FM_Tat_Award_F_016", "ZONE_TORSO", 2400],
    ["Clown and Gun", "multiplayer_overlays", "FM_Tat_Award_M_017", "FM_Tat_Award_F_017", "ZONE_TORSO", 5100],
    ["Clown Dual Wield", "multiplayer_overlays", "FM_Tat_Award_M_018", "FM_Tat_Award_F_018", "ZONE_TORSO", 7400],
    ["Clown Dual Wield Dollars", "multiplayer_overlays", "FM_Tat_Award_M_019", "FM_Tat_Award_F_019", "ZONE_TORSO", 10000],
    ["Brotherhood", "multiplayer_overlays", "FM_Tat_M_000", "FM_Tat_F_000", "ZONE_RIGHT_ARM", 10000],
    ["Dragons", "multiplayer_overlays", "FM_Tat_M_001", "FM_Tat_F_001", "ZONE_RIGHT_ARM", 12500],
    ["Melting Skull", "multiplayer_overlays", "FM_Tat_M_002", "FM_Tat_F_002", "ZONE_LEFT_LEG", 3750],
    ["Dragons and Skull", "multiplayer_overlays", "FM_Tat_M_003", "FM_Tat_F_003", "ZONE_RIGHT_ARM", 10000],
    ["Faith", "multiplayer_overlays", "FM_Tat_M_004", "FM_Tat_F_004", "ZONE_TORSO", 10000],
    ["Serpents", "multiplayer_overlays", "FM_Tat_M_005", "FM_Tat_F_005", "ZONE_LEFT_ARM", 2400],
    ["Oriental Mural", "multiplayer_overlays", "FM_Tat_M_006", "FM_Tat_F_006", "ZONE_LEFT_ARM", 5100],
    ["The Warrior", "multiplayer_overlays", "FM_Tat_M_007", "FM_Tat_F_007", "ZONE_RIGHT_LEG", 3750],
    ["Dragon Mural", "multiplayer_overlays", "FM_Tat_M_008", "FM_Tat_F_008", "ZONE_LEFT_LEG", 4800],
    ["Skull on the Cross", "multiplayer_overlays", "FM_Tat_M_009", "FM_Tat_F_009", "ZONE_TORSO", 12350],
    ["LS Flames", "multiplayer_overlays", "FM_Tat_M_010", "FM_Tat_F_010", "ZONE_TORSO", 2500],
    ["LS Script", "multiplayer_overlays", "FM_Tat_M_011", "FM_Tat_F_011", "ZONE_TORSO", 1900],
    ["Los Santos Bills", "multiplayer_overlays", "FM_Tat_M_012", "FM_Tat_F_012", "ZONE_TORSO", 10000],
    ["Eagle and Serpent", "multiplayer_overlays", "FM_Tat_M_013", "FM_Tat_F_013", "ZONE_TORSO", 4500],
    ["Flower Mural", "multiplayer_overlays", "FM_Tat_M_014", "FM_Tat_F_014", "ZONE_RIGHT_ARM", 5000],
    ["Zodiac Skull", "multiplayer_overlays", "FM_Tat_M_015", "FM_Tat_F_015", "ZONE_LEFT_ARM", 3600],
    ["Evil Clown", "multiplayer_overlays", "FM_Tat_M_016", "FM_Tat_F_016", "ZONE_TORSO", 12250],
    ["Tribal", "multiplayer_overlays", "FM_Tat_M_017", "FM_Tat_F_017", "ZONE_RIGHT_LEG", 3500],
    ["Serpent Skull", "multiplayer_overlays", "FM_Tat_M_018", "FM_Tat_F_018", "ZONE_RIGHT_ARM", 7500],
    ["The Wages of Sin", "multiplayer_overlays", "FM_Tat_M_019", "FM_Tat_F_019", "ZONE_TORSO", 12300],
    ["Dragon", "multiplayer_overlays", "FM_Tat_M_020", "FM_Tat_F_020", "ZONE_TORSO", 7500],
    ["Fiery Dragon", "multiplayer_overlays", "FM_Tat_M_022", "FM_Tat_F_022", "ZONE_RIGHT_LEG", 7300],
    ["Hottie", "multiplayer_overlays", "FM_Tat_M_023", "FM_Tat_F_023", "ZONE_LEFT_LEG", 7250],
    ["Flaming Cross", "multiplayer_overlays", "FM_Tat_M_024", "FM_Tat_F_024", "ZONE_TORSO", 11900],
    ["LS Bold", "multiplayer_overlays", "FM_Tat_M_025", "FM_Tat_F_025", "ZONE_TORSO", 2750],
    ["Smoking Dagger", "multiplayer_overlays", "FM_Tat_M_026", "FM_Tat_F_026", "ZONE_LEFT_LEG", 1750],
    ["Virgin Mary", "multiplayer_overlays", "FM_Tat_M_027", "FM_Tat_F_027", "ZONE_RIGHT_ARM", 7300],
    ["Mermaid", "multiplayer_overlays", "FM_Tat_M_028", "FM_Tat_F_028", "ZONE_RIGHT_ARM", 3250],
    ["Trinity Knot", "multiplayer_overlays", "FM_Tat_M_029", "FM_Tat_F_029", "ZONE_TORSO", 1000],
    ["Lucky Celtic Dogs", "multiplayer_overlays", "FM_Tat_M_030", "FM_Tat_F_030", "ZONE_TORSO", 5000],
    ["Lady M", "multiplayer_overlays", "FM_Tat_M_031", "FM_Tat_F_031", "ZONE_LEFT_ARM", 7500],
    ["Faith", "multiplayer_overlays", "FM_Tat_M_032", "FM_Tat_F_032", "ZONE_LEFT_LEG", 5100],
    ["Chinese Dragon", "multiplayer_overlays", "FM_Tat_M_033", "FM_Tat_F_033", "ZONE_LEFT_LEG", 5050],
    ["Flaming Shamrock", "multiplayer_overlays", "FM_Tat_M_034", "FM_Tat_F_034", "ZONE_TORSO", 2450],
    ["Dragon", "multiplayer_overlays", "FM_Tat_M_035", "FM_Tat_F_035", "ZONE_TORSO", 4950],
    ["Way of the Gun", "multiplayer_overlays", "FM_Tat_M_036", "FM_Tat_F_036", "ZONE_TORSO", 5100],
    ["Grim Reaper", "multiplayer_overlays", "FM_Tat_M_037", "FM_Tat_F_037", "ZONE_LEFT_LEG", 12250],
    ["Dagger", "multiplayer_overlays", "FM_Tat_M_038", "FM_Tat_F_038", "ZONE_RIGHT_ARM", 1150],
    ["Broken Skull", "multiplayer_overlays", "FM_Tat_M_039", "FM_Tat_F_039", "ZONE_RIGHT_LEG", 7500],
    ["Flaming Skull", "multiplayer_overlays", "FM_Tat_M_040", "FM_Tat_F_040", "ZONE_RIGHT_LEG", 7600],
    ["Dope Skull", "multiplayer_overlays", "FM_Tat_M_041", "FM_Tat_F_041", "ZONE_LEFT_ARM", 2600],
    ["Flaming Scorpion", "multiplayer_overlays", "FM_Tat_M_042", "FM_Tat_F_042", "ZONE_RIGHT_LEG", 2500],
    ["Indian Ram", "multiplayer_overlays", "FM_Tat_M_043", "FM_Tat_F_043", "ZONE_RIGHT_LEG", 7450],
    ["Stone Cross", "multiplayer_overlays", "FM_Tat_M_044", "FM_Tat_F_044", "ZONE_TORSO", 7500],
    ["Skulls and Rose", "multiplayer_overlays", "FM_Tat_M_045", "FM_Tat_F_045", "ZONE_TORSO", 10000],
    ["Lion", "multiplayer_overlays", "FM_Tat_M_047", "FM_Tat_F_047", "ZONE_RIGHT_ARM", 2500],
    ['Wolf', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_000_M', 'MP_Christmas2017_Tattoo_000_F', 'ZONE_TORSO', 1500],
    ['Mkb', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_001_M', 'MP_Christmas2017_Tattoo_001_F', 'ZONE_LEFT_ARM', 1900],
    ['Diabolo 1080', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_002_M', 'MP_Christmas2017_Tattoo_002_F', 'ZONE_TORSO', 1420],
    ['RedPep', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_003_M', 'MP_Christmas2017_Tattoo_003_F', 'ZONE_TORSO', 1600],
    ['DSnake', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_004_M', 'MP_Christmas2017_Tattoo_004_F', 'ZONE_LEFT_ARM', 2800],
    ['DWarrior', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_005_M', 'MP_Christmas2017_Tattoo_005_F', 'ZONE_TORSO', 4450],
    ['Jellyfish', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_006_M', 'MP_Christmas2017_Tattoo_006_F', 'ZONE_RIGHT_ARM', 2800],
    ['PSkin', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_007_M', 'MP_Christmas2017_Tattoo_007_F', 'ZONE_LEFT_ARM', 3150],
    ['DeadRome', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_008_M', 'MP_Christmas2017_Tattoo_008_F', 'ZONE_TORSO', 2950],
    ['IGnome', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_009_M', 'MP_Christmas2017_Tattoo_009_F', 'ZONE_TORSO', 2650],
    ['RWarrior', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_010_M', 'MP_Christmas2017_Tattoo_010_F', 'ZONE_TORSO', 3000],
    ['Skull', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_011_M', 'MP_Christmas2017_Tattoo_011_F', 'ZONE_TORSO', 3350],
    ['Catwoman', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_012_M', 'MP_Christmas2017_Tattoo_012_F', 'ZONE_RIGHT_ARM', 1050],
    ['Katana', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_013_M', 'MP_Christmas2017_Tattoo_013_F', 'ZONE_LEFT_ARM', 3450],
    ['Bracelet', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_014_M', 'MP_Christmas2017_Tattoo_014_F', 'ZONE_RIGHT_ARM', 850],
    ['Samurai', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_015_M', 'MP_Christmas2017_Tattoo_015_F', 'ZONE_TORSO', 3550],
    ['Raven', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_016_M', 'MP_Christmas2017_Tattoo_016_F', 'ZONE_TORSO', 3850],
    ['Wing', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_017_M', 'MP_Christmas2017_Tattoo_017_F', 'ZONE_RIGHT_ARM', 2900],
    ['Meat', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_018_M', 'MP_Christmas2017_Tattoo_018_F', 'ZONE_RIGHT_ARM', 2350],
    ['SForce', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_019_M', 'MP_Christmas2017_Tattoo_019_F', 'ZONE_TORSO', 2150],
    ['Jellyfish2', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_020_M', 'MP_Christmas2017_Tattoo_020_F', 'ZONE_TORSO', 3200],
    ['Battle', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_021_M', 'MP_Christmas2017_Tattoo_021_F', 'ZONE_TORSO', 3750],
    ['RRider', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_022_M', 'MP_Christmas2017_Tattoo_022_F', 'ZONE_TORSO', 4000],
    ['Demon', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_023_M', 'MP_Christmas2017_Tattoo_023_F', 'ZONE_RIGHT_ARM', 3800],
    ['Dragon', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_024_M', 'MP_Christmas2017_Tattoo_024_F', 'ZONE_TORSO', 3150],
    ['FSnake', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_025_M', 'MP_Christmas2017_Tattoo_025_F', 'ZONE_LEFT_ARM', 3600],
    ['Skull2', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_026_M', 'MP_Christmas2017_Tattoo_026_F', 'ZONE_TORSO', 2500],
    ['Swords', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_027_M', 'MP_Christmas2017_Tattoo_027_F', 'ZONE_TORSO', 3000],
    ['Bracelet2', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_028_M', 'MP_Christmas2017_Tattoo_028_F', 'ZONE_RIGHT_ARM', 1800],
    ['DDogs', 'mpchristmas2017_overlays', 'MP_Christmas2017_Tattoo_029_M', 'MP_Christmas2017_Tattoo_029_F', 'ZONE_LEFT_ARM', 3100],
    ['Knife', 'mpvinewood_overlays', 'MP_Vinewood_Tat_000_M', 'MP_Vinewood_Tat_000_F', 'ZONE_TORSO', 2850],
    ['Jackpot', 'mpvinewood_overlays', 'MP_Vinewood_Tat_001_M', 'MP_Vinewood_Tat_001_F', 'ZONE_TORSO', 2950],
    ['Cards', 'mpvinewood_overlays', 'MP_Vinewood_Tat_002_M', 'MP_Vinewood_Tat_002_F', 'ZONE_LEFT_ARM', 2650],
    ['Skull3', 'mpvinewood_overlays', 'MP_Vinewood_Tat_003_M', 'MP_Vinewood_Tat_003_F', 'ZONE_TORSO', 2600],
    ['LadyLuck', 'mpvinewood_overlays', 'MP_Vinewood_Tat_004_M', 'MP_Vinewood_Tat_004_F', 'ZONE_RIGHT_ARM', 3100],
    ['GetLucky', 'mpvinewood_overlays', 'MP_Vinewood_Tat_005_M', 'MP_Vinewood_Tat_005_F', 'ZONE_LEFT_ARM', 3000],
    ['Pattern', 'mpvinewood_overlays', 'MP_Vinewood_Tat_006_M', 'MP_Vinewood_Tat_006_F', 'ZONE_TORSO', 6500],
    ['777', 'mpvinewood_overlays', 'MP_Vinewood_Tat_007_M', 'MP_Vinewood_Tat_007_F', 'ZONE_TORSO', 2750],
    ['LuckySnake', 'mpvinewood_overlays', 'MP_Vinewood_Tat_008_M', 'MP_Vinewood_Tat_008_F', 'ZONE_TORSO', 3400],
    ['FillDeath', 'mpvinewood_overlays', 'MP_Vinewood_Tat_009_M', 'MP_Vinewood_Tat_009_F', 'ZONE_TORSO', 4000],
    ['Races', 'mpvinewood_overlays', 'MP_Vinewood_Tat_010_M', 'MP_Vinewood_Tat_010_F', 'ZONE_TORSO', 4150],
    ['Gamble', 'mpvinewood_overlays', 'MP_Vinewood_Tat_011_M', 'MP_Vinewood_Tat_011_F', 'ZONE_TORSO', 4000],
    ['LuckySkull', 'mpvinewood_overlays', 'MP_Vinewood_Tat_012_M', 'MP_Vinewood_Tat_012_F', 'ZONE_TORSO', 3100],
    ['Cowboy', 'mpvinewood_overlays', 'MP_Vinewood_Tat_013_M', 'MP_Vinewood_Tat_013_F', 'ZONE_LEFT_LEG', 2000],
    ['Lady', 'mpvinewood_overlays', 'MP_Vinewood_Tat_014_M', 'MP_Vinewood_Tat_014_F', 'ZONE_LEFT_ARM', 2400],
    ['Joker', 'mpvinewood_overlays', 'MP_Vinewood_Tat_015_M', 'MP_Vinewood_Tat_015_F', 'ZONE_TORSO', 3750],
    ['Ace', 'mpvinewood_overlays', 'MP_Vinewood_Tat_016_M', 'MP_Vinewood_Tat_016_F', 'ZONE_TORSO', 3000],
    ['LadyLuck2', 'mpvinewood_overlays', 'MP_Vinewood_Tat_017_M', 'MP_Vinewood_Tat_017_F', 'ZONE_TORSO', 3800],
    ['Win', 'mpvinewood_overlays', 'MP_Vinewood_Tat_018_M', 'MP_Vinewood_Tat_018_F', 'ZONE_RIGHT_ARM', 3600],
    ['Excitement', 'mpvinewood_overlays', 'MP_Vinewood_Tat_019_M', 'MP_Vinewood_Tat_019_F', 'ZONE_LEFT_ARM', 2800],
    ['Dollar', 'mpvinewood_overlays', 'MP_Vinewood_Tat_020_M', 'MP_Vinewood_Tat_020_F', 'ZONE_RIGHT_LEG', 1000],
    ['Lady', 'mpvinewood_overlays', 'MP_Vinewood_Tat_021_M', 'MP_Vinewood_Tat_021_F', 'ZONE_TORSO', 3000],
    ['Cash', 'mpvinewood_overlays', 'MP_Vinewood_Tat_022_M', 'MP_Vinewood_Tat_022_F', 'ZONE_TORSO', 1500],
    ['Horseshoe', 'mpvinewood_overlays', 'MP_Vinewood_Tat_023_M', 'MP_Vinewood_Tat_023_F', 'ZONE_TORSO', 2750],
    ['Lips', 'mpvinewood_overlays', 'MP_Vinewood_Tat_024_M', 'MP_Vinewood_Tat_024_F', 'ZONE_TORSO', 2800],
    ['Queen', 'mpvinewood_overlays', 'MP_Vinewood_Tat_025_M', 'MP_Vinewood_Tat_025_F', 'ZONE_RIGHT_ARM', 1500],
    ['Rose', 'mpvinewood_overlays', 'MP_Vinewood_Tat_026_M', 'MP_Vinewood_Tat_026_F', 'ZONE_LEFT_ARM', 3150],
    ['Ball', 'mpvinewood_overlays', 'MP_Vinewood_Tat_027_M', 'MP_Vinewood_Tat_027_F', 'ZONE_LEFT_LEG', 1600],
    ['Skull4', 'mpvinewood_overlays', 'MP_Vinewood_Tat_028_M', 'MP_Vinewood_Tat_028_F', 'ZONE_RIGHT_ARM', 1450],
    ['Casino', 'mpvinewood_overlays', 'MP_Vinewood_Tat_029_M', 'MP_Vinewood_Tat_029_F', 'ZONE_TORSO', 3750],
    ['Cards2', 'mpvinewood_overlays', 'MP_Vinewood_Tat_030_M', 'MP_Vinewood_Tat_030_F', 'ZONE_TORSO', 3400],
    ['Win2', 'mpvinewood_overlays', 'MP_Vinewood_Tat_031_M', 'MP_Vinewood_Tat_031_F', 'ZONE_TORSO', 2650],
    ['Excitement2', 'mpvinewood_overlays', 'MP_Vinewood_Tat_032_M', 'MP_Vinewood_Tat_032_F', 'ZONE_TORSO', 4000],
]
import { coffer } from '../coffer';
// import { chat } from '../modules/chat';

// chat.registerCommand('tattoo', player => {
//     tattoo.openMenu(player, 0);
// })
/*
UIMenu.Menu.AddMenuItem('Торс').zone = 'ZONE_TORSO';
    UIMenu.Menu.AddMenuItem('Левая рука').zone = 'ZONE_LEFT_ARM';
    UIMenu.Menu.AddMenuItem('Правая рука').zone = 'ZONE_RIGHT_ARM';
    UIMenu.Menu.AddMenuItem('Левая нога').zone = 'ZONE_LEFT_LEG';
    UIMenu.Menu.AddMenuItem('Правая нога').zone = 'ZONE_RIGHT_LEG';
*/
export let tattoo = {
    openMenu: (player: PlayerMp, shopId:number) => {
        if(user.hasAnyWeapon(player)) return player.notify(`~r~Спрячьте оружие, мастер нервничает`)
        let m = menu.new(player, "", "Категории");
        switch (shopId) {
            case 94:
                m.sprite = "shopui_title_tattoos";
                break;
            case 95:
                m.sprite = "shopui_title_tattoos2";
                break;
            case 96:
                m.sprite = "shopui_title_tattoos3";
                break;
            case 97:
                m.sprite = "shopui_title_tattoos4";
                break;
            case 98:
                m.sprite = "shopui_title_tattoos5";
                break;
            default:
                m.title = 'Тату салон'
                break;
        }

        let categorys: [string, string][] = [
            ["Голова", "ZONE_HEAD"],
            ["Торс", "ZONE_TORSO"],
            ["Левая рука", "ZONE_LEFT_ARM"],
            ["Правая рука", "ZONE_RIGHT_ARM"],
            ["Левая нога", "ZONE_LEFT_LEG"],
            ["Правая нога", "ZONE_RIGHT_LEG"],
        ]
        categorys.map(qs => {
            let list = config.filter(itm => itm[4] == qs[1])
            if (user.getSex(player)) list = list.filter(item => item[3])
            else list = list.filter(item => item[2])
            m.newItem({
                name: qs[0],
                more: "Вариаций: x"+list.length,
                onpress: () => {
                    let srch = "";
                    const op = () => {
                        user.takeOffCloth(player);
                        
                        if (srch) list = list.filter(item => (item[0] as string).toLowerCase().indexOf(srch) > -1)
                        let submenu = menu.new(player, "Тату салон", "Список тату");
                        submenu.onclose = () => { user.resetCustomization(player);}
                        submenu.newItem({
                            name: "Поиск по названию",
                            onpress: () => {
                                menu.input(player, "Введите название для поиска").then(name => {
                                    if (!name) srch = ""
                                    else srch = name.toLowerCase();
                                    op();
                                })
                            }
                        })
                        if(list.length == 0){
                            submenu.newItem({
                                name: "~r~Пусто"
                            })
                        } else {
                            list.map(item => {
                                if (user.hasTattoo(player, (item[1] as string), ((user.getSex(player) ? item[3] : item[2]) as string))){
                                    submenu.newItem({
                                        name: item[0] as string,
                                        more: "~g~Набито",
                                        desc: "Свести: ~g~$" + ((item[5] as number) * 2),
                                        onpress: () => {
                                            if (!user.hasTattoo(player, (item[1] as string), ((user.getSex(player) ? item[3] : item[2]) as string))) return player.notify(`~r~Вы уже свели данное тату`)
                                            if (user.getCashMoney(player) < ((item[5] as number) * 2)) return player.notify(`~r~У вас недостаточно средств для оплаты услуг мастера`)
                                            user.removeCashMoney(player, ((item[5] as number) * 2));
                                            player.notify(`~g~Тату сведено`)
                                            user.log(player, "Tattoo", `Свёл тату ${mp.joaat(item[1] as string)} ${mp.joaat((user.getSex(player) ? item[3] : item[2]) as string)} $${((item[5] as number) * 2)} ${shopId}`)

                                            coffer.addMoney(((item[5] as number))*2 * 0.1)
                                            business.addMoney(shopId, ((item[5] as number)) * 2 * 0.9);
                                            user.removeTattoo(player, (item[1] as string), ((user.getSex(player) ? item[3] : item[2]) as string))
                                        }
                                    })
                                } else {
                                    let showed = false;
                                    submenu.newItem({
                                        name: item[0] as string,
                                        type: "list",
                                        list: ["Предпросмотр", "Набить: ~g~$" + item[5]],
                                        onpress: (it) => {
                                            if (user.hasTattoo(player, (item[1] as string), ((user.getSex(player) ? item[3] : item[2]) as string))) return player.notify(`~r~Вы уже набили данное тату`)
                                            if(it.listSelected == 0){
                                                if(showed){
                                                    player.removeDecoration(mp.joaat(item[1] as string), mp.joaat((user.getSex(player) ? item[3] : item[2]) as string))
                                                    showed = false;
                                                } else {
                                                    player.setDecoration(mp.joaat(item[1] as string), mp.joaat((user.getSex(player) ? item[3] : item[2]) as string))
                                                    showed = true;
                                                }
                                            } else {
                                                if(user.getCashMoney(player) < item[5]) return player.notify(`~r~У вас недостаточно средств для оплаты услуг мастера`);
                                                if (player.tattoosList.length > 50) return player.notify(`~r~На вас так много тату, что уже нет места набивать`);
                                                user.removeCashMoney(player, item[5] as number);
                                                player.notify(`~g~Тату набито`)
                                                user.log(player, "Tattoo", `Набил тату ${mp.joaat(item[1] as string)} ${mp.joaat((user.getSex(player) ? item[3] : item[2]) as string)} $${item[5]} ${shopId}`)
                                                user.addTattoo(player, (item[1] as string), ((user.getSex(player) ? item[3] : item[2]) as string))
                                                coffer.addMoney((item[5] as number) * 0.1)
                                                business.addMoney(shopId, (item[5] as number)*0.9);
                                                player.setDecoration(mp.joaat(item[1] as string), mp.joaat((user.getSex(player) ? item[3] : item[2]) as string))
                                            }
                                        }
                                    })
                                }
                            })
                        }
    
    
                        submenu.open()
                    }
                    op();
                }
            })
        })
        m.open()
    },
    
    
    list: [
        [324.2816,180.2105,102.5865,94],
        [1864.066,3746.909,32.03188,95],
        [-294.0927,6200.76,30.48712,98],
        [-1155.336,-1427.223,3.954459,96],
        [1321.756,-1653.431,51.27526,97],
        // [-3,69.667,1077.457,19.82918,98]
    ],
    
    loadAll: function() {
        methods.debug('tattoo.loadAll');
        tattoo.list.forEach(function (item) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            methods.createBlip(shopPos, 75, 0, 0.8);
            methods.createStaticCheckpoint(shopPos.x, shopPos.y, shopPos.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
        });
    },
    
    getInRadius: function(pos:Vector3Mp, radius = 2) {
        // methods.debug('tattoo.getInRadius');
        let shopId = -1;
        tattoo.list.forEach(function (item, idx) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(pos, shopPos) < radius)
                shopId = methods.parseInt(item[3]);
        });
        return shopId;
    },
    
    checkPosForOpenMenu: function(player:PlayerMp) {
        // methods.debug('tattoo.checkPosForOpenMenu');
        try {
            let playerPos = player.position;
            let shopId = tattoo.getInRadius(playerPos, 2);
            if (shopId == -1)
                return;
            return tattoo.openMenu(player, shopId)
            switch (shopId)
            {
                case 94:
                    player.call('client:menuList:showTattooShopMenu', ["shopui_title_tattoos", "shopui_title_tattoos", shopId]);
                    break;
                case 95:
                    player.call('client:menuList:showTattooShopMenu', ["shopui_title_tattoos2", "shopui_title_tattoos2", shopId]);
                    break;
                case 96:
                    player.call('client:menuList:showTattooShopMenu', ["shopui_title_tattoos3", "shopui_title_tattoos3", shopId]);
                    break;
                case 97:
                    player.call('client:menuList:showTattooShopMenu', ["shopui_title_tattoos4", "shopui_title_tattoos4", shopId]);
                    break;
                case 98:
                    player.call('client:menuList:showTattooShopMenu', ["shopui_title_tattoos5", "shopui_title_tattoos5", shopId]);
                    break;
            }
        }
        catch (e) {
            methods.debug(e);
        }
    },
    
    findNearest: function(pos:Vector3Mp) {
        methods.debug('tattoo.findNearest');
        let prevPos = new mp.Vector3(9999, 9999, 9999);
        tattoo.list.forEach(function (item) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(shopPos, pos) < methods.distanceToPos(prevPos, pos))
                prevPos = shopPos;
        });
        return prevPos;
    },
    
    buy: function(player:PlayerMp, collection:string, overlay:string, zone:string, price:number, shopId:number) {
        if (!user.isLogin(player))
            return;
    
        if (user.getMoney(player) < price) {
            player.notify('~r~У вас недостаточно средств');
            return;
        }
    
        if (price < 1)
            return;


    
        switch (zone)
        {
            case "ZONE_HEAD":
                if (user.get(player, 'tattoo_head_c') != '') {
                    player.notify("~r~Татуировку сначала нужно свести");
                    user.updateTattoo(player);
                    return;
                }
    
                user.set(player, "tattoo_head_c", collection);
                user.set(player, "tattoo_head_o", overlay);
                break;
            case "ZONE_TORSO":
                if (user.get(player, 'tattoo_torso_c') != '')
                {
                    player.notify("~r~Татуировку сначала нужно свести");
                    user.updateTattoo(player);
                    return;
                }
    
                user.set(player, "tattoo_torso_c", collection);
                user.set(player, "tattoo_torso_o", overlay);
                break;
            case "ZONE_LEFT_ARM":
                if (user.get(player, 'tattoo_left_arm_c') != '')
                {
                    player.notify("~r~Татуировку сначала нужно свести");
                    user.updateTattoo(player);
                    return;
                }
    
                user.set(player, "tattoo_left_arm_c", collection);
                user.set(player, "tattoo_left_arm_o", overlay);
                break;
            case "ZONE_RIGHT_ARM":
                if (user.get(player, 'tattoo_right_arm_c') != '')
                {
                    player.notify("~r~Татуировку сначала нужно свести");
                    user.updateTattoo(player);
                    return;
                }
                user.set(player, "tattoo_right_arm_c", collection);
                user.set(player, "tattoo_right_arm_o", overlay);
                break;
            case "ZONE_RIGHT_LEG":
                if (user.get(player, 'tattoo_right_leg_c') != '')
                {
                    player.notify("~r~Татуировку сначала нужно свести");
                    user.updateTattoo(player);
                    return;
                }
    
                user.set(player, "tattoo_right_leg_c", collection);
                user.set(player, "tattoo_right_leg_o", overlay);
                break;
            case "ZONE_LEFT_LEG":
                if (user.get(player, 'tattoo_left_leg_c') != '')
                {
                    player.notify("~r~Татуировку сначала нужно свести");
                    user.updateTattoo(player);
                    return;
                }
    
                user.set(player, "tattoo_left_leg_c", collection);
                user.set(player, "tattoo_left_leg_o", overlay);
                break;
        }

        user.log(player, "Tattoo", `Набил тату ${collection} ${overlay} ${zone} ${price} ${shopId}`)
    
        user.removeMoney(player, price);
        business.addMoney(shopId, price);
        player.notify('~g~Вы набили татуировку');
        user.updateTattoo(player);
    },
    
    buyPrint: function(player:PlayerMp, collection:string, overlay:string, price:number) {
        if (!user.isLogin(player))
            return;
    
        if (user.getMoney(player) < price) {
            player.notify('~r~У вас недостаточно средств');
            return;
        }
    
        if (price < 1)
            return;
    
        if (user.get(player, 'tprint_c') != '') {
            player.notify("~r~На данном предмете одежды уже есть принт");
            user.updateTattoo(player);
            return;
        }
    
        user.set(player, "tprint_c", collection);
        user.set(player, "tprint_o", overlay);
    
        user.removeMoney(player, price);
        business.addMoney(166, price);
        user.log(player, "Print", `Купил принт ${collection} ${overlay} ${price}`)
        player.notify('~g~Вы купили принт');
        user.updateTattoo(player);
    },
    
    clear: function(player:PlayerMp, zone:string, price:number, shopId:number) {
        if (!user.isLogin(player))
            return;
    
        if (user.getMoney(player) < price) {
            player.notify('~r~У вас недостаточно средств');
            return;
        }
    
        if (price < 1)
            return;
    
        let collection = '';
        let overlay = '';
    
        switch (zone)
        {
            case "ZONE_HEAD":
                if (user.get(player, 'tattoo_head_c') == '') {
                    player.notify("~r~У вас нет татуировки");
                    user.updateTattoo(player);
                    return;
                }
    
                user.set(player, "tattoo_head_c", collection);
                user.set(player, "tattoo_head_o", overlay);
                break;
            case "ZONE_TORSO":
                if (user.get(player, 'tattoo_torso_c') == '')
                {
                    player.notify("~r~У вас нет татуировки");
                    user.updateTattoo(player);
                    return;
                }
    
                user.set(player, "tattoo_torso_c", collection);
                user.set(player, "tattoo_torso_o", overlay);
                break;
            case "ZONE_LEFT_ARM":
                if (user.get(player, 'tattoo_left_arm_c') == '')
                {
                    player.notify("~r~У вас нет татуировки");
                    user.updateTattoo(player);
                    return;
                }
    
                user.set(player, "tattoo_left_arm_c", collection);
                user.set(player, "tattoo_left_arm_o", overlay);
                break;
            case "ZONE_RIGHT_ARM":
                if (user.get(player, 'tattoo_right_arm_c') == '')
                {
                    player.notify("~r~У вас нет татуировки");
                    user.updateTattoo(player);
                    return;
                }
                user.set(player, "tattoo_right_arm_c", collection);
                user.set(player, "tattoo_right_arm_o", overlay);
                break;
            case "ZONE_RIGHT_LEG":
                if (user.get(player, 'tattoo_right_leg_c') == '')
                {
                    player.notify("~r~У вас нет татуировки");
                    user.updateTattoo(player);
                    return;
                }
    
                user.set(player, "tattoo_right_leg_c", collection);
                user.set(player, "tattoo_right_leg_o", overlay);
                break;
            case "ZONE_LEFT_LEG":
                if (user.get(player, 'tattoo_left_leg_c') == '')
                {
                    player.notify("~r~У вас нет татуировки");
                    user.updateTattoo(player);
                    return;
                }
    
                user.set(player, "tattoo_left_leg_c", collection);
                user.set(player, "tattoo_left_leg_o", overlay);
                break;
        }
    
        user.removeMoney(player, price);
        business.addMoney(shopId, price);
        player.notify('~g~Вы свели татуировку');
        user.updateTattoo(player);
    }
};