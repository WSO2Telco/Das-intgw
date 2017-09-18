/*
 *  Copyright (c) 2016 WSO2.Telco Inc. (http://www.wso2telco.com) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
package org.wso2telco.analytics.hub.report.engine.internel.util;

import org.apache.commons.io.FilenameUtils;
import org.wso2.carbon.analytics.datasource.commons.Record;
import org.apache.commons.io.comparator.LastModifiedFileComparator;

import java.io.*;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

public class CSVWriter {

    public static void writeTransactionCSV(List<Record> records, int bufSize, String filePath, String user) throws IOException {

        File file = deleteIfExists(filePath);
        file.getParentFile().mkdirs();
        FileWriter writer = new FileWriter(file, true);
        BufferedWriter bufferedWriter = new BufferedWriter(writer, bufSize);

        StringBuilder sb = new StringBuilder();
        sb.append("API");
//      sb.append(',');
//      sb.append("MSISDN");
        sb.append(',');
        sb.append("Date Time");
        sb.append(',');
        sb.append("Service Provider");
        sb.append(',');
        sb.append("Application Name");
        sb.append(',');
//      sb.append("Operator Id");
//      sb.append(',');
        sb.append("Response Code");
        sb.append(System.getProperty("line.separator"));

        if (records.size() > 0) {
            for (Record record : records) {
                sb.append(record.getValues().get("api"));
                sb.append(',');
//              sb.append(record.getValues().get("msisdn"));
//              sb.append(',');
                Date date = new Date(Long.parseLong(record.getValues().get("responseTime").toString()));
                Format format = new SimpleDateFormat("yyyy MM dd HH:mm:ss");
                sb.append(format.format(date));
                sb.append(',');
                String spValue = (String) record.getValues().get("serviceProvider");
                sb.append(spValue.replace("@carbon.super", ""));

                sb.append(',');
                sb.append(record.getValues().get("applicationName"));
                sb.append(',');
//              sb.append(record.getValues().get("operatorId"));
//              sb.append(',');
                sb.append(record.getValues().get("responseCode"));
                sb.append(System.getProperty("line.separator"));
            }
            bufferedWriter.write(sb.toString());
        } else {
            bufferedWriter.write("No data available for this date range");
        }

        bufferedWriter.flush();
        bufferedWriter.close();

        boolean filedelted = deleteOldestfile(file.getParentFile(), user + "transreport.+");
    }

    private static File deleteIfExists(String filePath) {
        File file = new File(filePath);
        if (file.exists()) {
            file.delete();
        }
        return file;
    }

    //executed immediately after file n get create
    private static boolean deleteOldestfile(final File file, final String fileNameRegx) {
        boolean fileDeleted = false;
        final Pattern pattern = Pattern.compile(fileNameRegx);
        final HashMap<String, ArrayList<File>> splitFiles = new HashMap<>();

        File[] fileList = file.listFiles(new FileFilter() {
            @Override
            public boolean accept(File fileObj) {
                /*
                first matches the pattern and if that success get file obj. then check that file contains index num at last
                if yes put that into hashmap. next time when a file comes with same name file prefix
                ignor that file and count them all as single instance
                */
                String fileName = fileObj.getName();
                String fNameRegPrefix = fileNameRegx.split("\\.")[0];
                boolean acceptFlag = false;
                //if condition matches the prefix of the file
                if (pattern.matcher(fileName).matches()) {
                    //now cheeck if file is a splited file with a index
                    if (Pattern.matches(fNameRegPrefix + "\\d{24}\\-\\d+\\-\\d+.csv", fileName)) {
                        //if splitfile is not in hashmap add the file name to hashmap
                        String[] splitFilePrefix = fileName.split("-");
                        if (splitFiles.containsKey(splitFilePrefix[0])) {
                            splitFiles.get(splitFilePrefix[0]).add(fileObj);
                            acceptFlag = false;
                        } else {
                            ArrayList<File> fileList = new ArrayList<File>();
                            fileList.add(fileObj);
                            splitFiles.put(splitFilePrefix[0], fileList);
                            acceptFlag = true;
                        }
                    } else {
                        acceptFlag = pattern.matcher(fileObj.getName()).matches();
                    }
                }
                return acceptFlag;
            }
        });

        int fileCount = fileList.length;

        /*
        only keeps 10 files in dir.
        oldest file cannot be identify using -0-n file name pattern. 0-n file may not
        be the oldest one.
        */
        //TODO:move this as a configuration
        if (fileCount > 10) {
            //File.lastModified timestamp is considering to sorting array
            //check oldest file is a splitted file.if yes then get all spllited files in hashmap
            Arrays.sort(fileList, LastModifiedFileComparator.LASTMODIFIED_COMPARATOR);
            //oldest file is index 0. delete the oldest file
            File oldestFile = fileList[0];
            String oldestFileName = oldestFile.getName();
            if (oldestFileName.contains("-")) {
                String[] oldestFileNamePrefix = oldestFileName.split("-");
                if (splitFiles.containsKey(oldestFileNamePrefix[0])) {
                    ArrayList<File> files = splitFiles.get(oldestFileNamePrefix[0]);
                    for (File delFile : files) {
                        fileDeleted = delFile.delete();
                    }
                }
            } else {
                fileDeleted = oldestFile.delete();
            }
        }

        return fileDeleted;
    }

    public static void writeTrafficCSV(List<Record> records, int bufSize, String filePath, String user) throws IOException {

        File file = deleteIfExists(filePath);
        file.getParentFile().mkdirs();
        FileWriter writer = new FileWriter(file, true);
        BufferedWriter bufferedWriter = new BufferedWriter(writer, bufSize);

        Map<String, Integer> apiCount = new TreeMap<>();
        Integer count = 0;

        if (records.size() > 0) {
            for (Record record : records) {
                String key = record.getValues().get("api").toString();
                if (apiCount.containsKey(key)) {
                    count = apiCount.get(key) + Integer.parseInt(record.getValues().get("totalCount").toString());
                } else {
                    count = Integer.parseInt(record.getValues().get("totalCount").toString());
                }
                apiCount.put(key, count);
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("API");
        sb.append(',');
        sb.append("Total Count");
        sb.append(System.getProperty("line.separator"));

        if (records.size() > 0) {
            for (String key : apiCount.keySet()) {
                sb.append(key);
                sb.append(',');
                sb.append(apiCount.get(key));
                sb.append(System.getProperty("line.separator"));
            }
            bufferedWriter.write(sb.toString());
        } else {
            bufferedWriter.write("No data available for this date range");
        }
        bufferedWriter.flush();
        bufferedWriter.close();

        //TODO:set correct regex
        boolean filedelted = deleteOldestfile(file.getParentFile(), user + "trafficreport.+");


    }
}
