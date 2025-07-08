#!/usr/bin/env node

/**
 * Test script to verify printable report redesign
 * Tests the compact layout and removal of chart sections
 */

const fs = require('fs');
const path = require('path');

function testPrintableReportRedesign() {
    console.log('🔍 Testing Printable Report Redesign...\n');
    
    const reportPath = path.join(__dirname, 'src/components/PrintableReport.js');
    
    if (!fs.existsSync(reportPath)) {
        console.error('❌ PrintableReport.js not found');
        return false;
    }
    
    const content = fs.readFileSync(reportPath, 'utf8');
    
    // Test 1: Verify compact styles are present
    const compactStyleTests = [
        'padding: \'1.5cm\'', // Reduced padding
        'fontSize: \'9pt\'', // Smaller base font
        'gridTemplateColumns: \'1fr 1fr 1fr\'', // 3-column layout
        'compactTable', // Compact table styles
        'compactTh', // Compact table headers
        'compactTd', // Compact table cells
        'fontSize: \'8pt\'', // Smaller table font
        'padding: \'0.3rem 0.5rem\'', // Reduced table padding
        'marginBottom: \'1rem\'', // Reduced section spacing
    ];
    
    let passedTests = 0;
    let totalTests = compactStyleTests.length;
    
    console.log('📊 Checking compact styling...');
    compactStyleTests.forEach((test, index) => {
        if (content.includes(test)) {
            console.log(`✅ ${index + 1}. Found compact style: ${test}`);
            passedTests++;
        } else {
            console.log(`❌ ${index + 1}. Missing compact style: ${test}`);
        }
    });
    
    // Test 2: Verify chart sections are removed
    const chartRemovalTests = [
        'ChartPlaceholder', // Chart component should be removed
        'Visual Analysis', // Chart section should be removed
        'chartPlaceholder:', // Chart styles should be removed
        'Interactive charts are available', // Chart placeholder text should be removed
    ];
    
    console.log('\n🚫 Checking chart removal...');
    chartRemovalTests.forEach((test, index) => {
        if (!content.includes(test)) {
            console.log(`✅ ${index + 1}. Correctly removed: ${test}`);
            passedTests++;
            totalTests++;
        } else {
            console.log(`❌ ${index + 1}. Still present: ${test}`);
            totalTests++;
        }
    });
    
    // Test 3: Verify data density improvements
    const densityTests = [
        'marginBottom: \'0.5rem\'', // Reduced margins
        'gap: \'0.5rem\'', // Reduced gaps
        'fontSize: \'7pt\'', // Even smaller font for dense data
        'padding: \'0.2rem 0.3rem\'', // Very compact padding
    ];
    
    console.log('\n📈 Checking data density improvements...');
    densityTests.forEach((test, index) => {
        if (content.includes(test)) {
            console.log(`✅ ${index + 1}. Found density improvement: ${test}`);
            passedTests++;
        } else {
            console.log(`❌ ${index + 1}. Missing density improvement: ${test}`);
        }
        totalTests++;
    });
    
    // Test 4: Verify page break optimization
    console.log('\n📄 Checking page break optimization...');
    const pageBreakMatches = content.match(/pageBreakBefore:/g);
    if (pageBreakMatches && pageBreakMatches.length === 1) {
        console.log('✅ Page break properly configured for compact layout');
        passedTests++;
    } else {
        console.log(`❌ Found ${pageBreakMatches ? pageBreakMatches.length : 0} page breaks, expected 1`);
    }
    totalTests++;
    
    // Test 5: Verify compact summary grid
    console.log('\n📊 Checking summary grid optimization...');
    if (content.includes('gridTemplateColumns: \'1fr 1fr 1fr\'')) {
        console.log('✅ Summary grid uses 3 columns for better space utilization');
        passedTests++;
    } else {
        console.log('❌ Summary grid not optimized to 3 columns');
    }
    totalTests++;
    
    // Final results
    console.log('\n' + '='.repeat(50));
    console.log(`📋 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
    console.log(`✅ Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Printable report redesign is complete.');
        return true;
    } else {
        console.log('⚠️  Some tests failed. Please review the implementation.');
        return false;
    }
}

// Run the test
if (require.main === module) {
    testPrintableReportRedesign();
}

module.exports = testPrintableReportRedesign;
