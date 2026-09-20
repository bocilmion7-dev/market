-- AlterTable: Add cityName, districtName, provinceName to publisher_profiles
ALTER TABLE "publisher_profiles" ADD COLUMN "province_name" VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE "publisher_profiles" ADD COLUMN "city_name" VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE "publisher_profiles" ADD COLUMN "district_name" VARCHAR(100) NOT NULL DEFAULT '';
