PRAGMA default_null_order='NULLS FIRST';
copy (select metadata.accession as accession,
             metadata.accessionVersion as accessionVersion,
             metadata.dataUseTerms as dataUseTerms,
             metadata.dataUseTermsRestrictedUntil as dataUseTermsRestrictedUntil
      from 'data/input_file.ndjson.zst' where dataUseTerms = 'RESTRICTED' order by accessionVersion) to 'queries/test1_result.ndjson' (FORMAT JSON);
copy (select metadata.accession as accession,
             metadata.accessionVersion as accessionVersion,
             metadata.dataUseTerms as dataUseTerms
      from 'data/input_file.ndjson.zst' where dataUseTerms = 'OPEN' order by accessionVersion) to 'queries/test2_result.ndjson' (FORMAT JSON);
copy (select metadata.accession as accession,
             metadata.accessionVersion as accessionVersion
      from 'data/input_file.ndjson.zst' where metadata.geoLocCountry = 'Democratic Republic of the Congo' order by accessionVersion) to 'queries/test3_result.ndjson' (FORMAT JSON);
copy (select metadata.accession as accession,
             metadata.accessionVersion as accessionVersion
      from 'data/input_file.ndjson.zst' where metadata.geoLocCountry = 'Republic of the Congo' order by accessionVersion) to 'queries/test4_result.ndjson' (FORMAT JSON);
copy (select metadata.accession as accession,
             metadata.accessionVersion as accessionVersion
      from 'data/input_file.ndjson.zst' where metadata.geoLocCountry = 'USA' order by accessionVersion) to 'queries/test5_result.ndjson' (FORMAT JSON);
copy (select metadata.geoLocCountry as geoLocCountry, COUNT(*) as count
      from 'data/input_file.ndjson.zst' group by all order by geoLocCountry) to 'queries/test6_result.ndjson' (FORMAT JSON);
copy (select metadata.geoLocCountry as geoLocCountry, metadata.ncbiSubmitterCountry as ncbiSubmitterCountry, COUNT(*) as count
      from 'data/input_file.ndjson.zst' group by all order by geoLocCountry,ncbiSubmitterCountry) to 'queries/test7_result.ndjson' (FORMAT JSON);
copy (select metadata.geoLocCountry as geoLocCountry, COUNT(*) as count
      from 'data/input_file.ndjson.zst' where metadata.authors LIKE 'A%' group by all order by geoLocCountry) to 'queries/test8_result.ndjson' (FORMAT JSON);
