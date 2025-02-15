const vehicles = {
    'Buick': {
      'Grand National': [
        // 1978-1987-g-body
        { year: 1987, platform: '1978-1987-g-body' },
        { year: 1986, platform: '1978-1987-g-body' },
        { year: 1985, platform: '1978-1987-g-body' },
        { year: 1984, platform: '1978-1987-g-body' },
        { year: 1983, platform: '1978-1987-g-body' },
        { year: 1982, platform: '1978-1987-g-body' },
      ],
      'Grand Sport': [
        // 1964-1972-a-body
        { year: 1972, platform: '1964-1972-a-body' },
        { year: 1971, platform: '1964-1972-a-body' },
        { year: 1970, platform: '1964-1972-a-body' },
        { year: 1969, platform: '1964-1972-a-body' },
        { year: 1968, platform: '1964-1972-a-body' },
        { year: 1967, platform: '1964-1972-a-body' },
        { year: 1966, platform: '1964-1972-a-body' },
        { year: 1965, platform: '1964-1972-a-body' },
        { year: 1964, platform: '1964-1972-a-body' },
      ],
      'Regal': [
        // 1996-2006-w-body
        { year: 2006, platform: '1996-2006-w-body' },
        { year: 2005, platform: '1996-2006-w-body' },
        { year: 2004, platform: '1996-2006-w-body' },
        { year: 2003, platform: '1996-2006-w-body' },
        { year: 2002, platform: '1996-2006-w-body' },
        { year: 2001, platform: '1996-2006-w-body' },
        { year: 2000, platform: '1996-2006-w-body' },
        { year: 1999, platform: '1996-2006-w-body' },
        { year: 1998, platform: '1996-2006-w-body' },
        { year: 1997, platform: '1996-2006-w-body' },
        { year: 1996, platform: '1996-2006-w-body' },
  
        // 1978-1987-g-body
        { year: 1987, platform: '1978-1987-g-body' },
        { year: 1986, platform: '1978-1987-g-body' },
        { year: 1985, platform: '1978-1987-g-body' },
        { year: 1984, platform: '1978-1987-g-body' },
        { year: 1983, platform: '1978-1987-g-body' },
        { year: 1982, platform: '1978-1987-g-body' },
        { year: 1981, platform: '1978-1987-g-body' },
        { year: 1980, platform: '1978-1987-g-body' },
        { year: 1979, platform: '1978-1987-g-body' },
        { year: 1978, platform: '1978-1987-g-body' }
      ],
      'Skylark': [
        // 1964-1972-a-body
        { year: 1972, platform: '1964-1972-a-body' },
        { year: 1971, platform: '1964-1972-a-body' },
        { year: 1970, platform: '1964-1972-a-body' },
        { year: 1969, platform: '1964-1972-a-body' },
        { year: 1968, platform: '1964-1972-a-body' },
        { year: 1967, platform: '1964-1972-a-body' },
        { year: 1966, platform: '1964-1972-a-body' },
        { year: 1965, platform: '1964-1972-a-body' },
        { year: 1964, platform: '1964-1972-a-body' },
      ],
    },
    'Ford': {
      'Mustang': [
        // 2024-mustang
        { year: 2024, platform: '2024-mustang' },
  
        // 2015-2023-mustang
        { year: 2023, platform: '2015-2023-mustang' },
        { year: 2022, platform: '2015-2023-mustang' },
        { year: 2021, platform: '2015-2023-mustang' },
        { year: 2020, platform: '2015-2023-mustang' },
        { year: 2019, platform: '2015-2023-mustang' },
        { year: 2018, platform: '2015-2023-mustang' },
        { year: 2017, platform: '2015-2023-mustang' },
        { year: 2016, platform: '2015-2023-mustang' },
        { year: 2015, platform: '2015-2023-mustang' },
  
        // 2005-2014-mustang
        { year: 2014, platform: '2005-2014-mustang' },
        { year: 2013, platform: '2005-2014-mustang' },
        { year: 2012, platform: '2005-2014-mustang' },
        { year: 2011, platform: '2005-2014-mustang' },
        { year: 2010, platform: '2005-2014-mustang' },
        { year: 2009, platform: '2005-2014-mustang' },
        { year: 2008, platform: '2005-2014-mustang' },
        { year: 2007, platform: '2005-2014-mustang' },
        { year: 2006, platform: '2005-2014-mustang' },
        { year: 2005, platform: '2005-2014-mustang' },
  
        // 1979-2004-mustang
        { year: 2004, platform: '1979-2004-mustang' },
        { year: 2003, platform: '1979-2004-mustang' },
        { year: 2002, platform: '1979-2004-mustang' },
        { year: 2001, platform: '1979-2004-mustang' },
        { year: 2000, platform: '1979-2004-mustang' },
        { year: 1999, platform: '1979-2004-mustang' },
        { year: 1998, platform: '1979-2004-mustang' },
        { year: 1997, platform: '1979-2004-mustang' },
        { year: 1996, platform: '1979-2004-mustang' },
        { year: 1995, platform: '1979-2004-mustang' },
        { year: 1994, platform: '1979-2004-mustang' },
        { year: 1993, platform: '1979-2004-mustang' },
        { year: 1992, platform: '1979-2004-mustang' },
        { year: 1991, platform: '1979-2004-mustang' },
        { year: 1990, platform: '1979-2004-mustang' },
        { year: 1989, platform: '1979-2004-mustang' },
        { year: 1988, platform: '1979-2004-mustang' },
        { year: 1987, platform: '1979-2004-mustang' },
        { year: 1986, platform: '1979-2004-mustang' },
        { year: 1985, platform: '1979-2004-mustang' },
        { year: 1984, platform: '1979-2004-mustang' },
        { year: 1983, platform: '1979-2004-mustang' },
        { year: 1982, platform: '1979-2004-mustang' },
        { year: 1981, platform: '1979-2004-mustang' },
        { year: 1980, platform: '1979-2004-mustang' },
        { year: 1979, platform: '1979-2004-mustang' } 
      ],
      'Shelby GT500': [
        // 2007-2014-shelby-gt500
        { year: 2014, platform: '2007-2014-shelby-gt500' },
        { year: 2013, platform: '2007-2014-shelby-gt500' },
        { year: 2012, platform: '2007-2014-shelby-gt500' },
        { year: 2011, platform: '2007-2014-shelby-gt500' },
        { year: 2010, platform: '2007-2014-shelby-gt500' },
        { year: 2009, platform: '2007-2014-shelby-gt500' },
        { year: 2008, platform: '2007-2014-shelby-gt500' },
        { year: 2007, platform: '2007-2014-shelby-gt500' }
      ],
    },
    'Chevrolet': {
      'Camaro': [
        // 2016-2024-chevy-camaro
        { year: 2024, platform: '2016-2024-chevy-camaro' },
        { year: 2023, platform: '2016-2024-chevy-camaro' },
        { year: 2022, platform: '2016-2024-chevy-camaro' },
        { year: 2021, platform: '2016-2024-chevy-camaro' },
        { year: 2020, platform: '2016-2024-chevy-camaro' },
        { year: 2019, platform: '2016-2024-chevy-camaro' },
        { year: 2018, platform: '2016-2024-chevy-camaro' },
        { year: 2017, platform: '2016-2024-chevy-camaro' },
        { year: 2016, platform: '2016-2024-chevy-camaro' },
  
        // 2010-2015-chevy-camaro
        { year: 2015, platform: '2010-2015-chevy-camaro' },
        { year: 2014, platform: '2010-2015-chevy-camaro' },
        { year: 2013, platform: '2010-2015-chevy-camaro' },
        { year: 2012, platform: '2010-2015-chevy-camaro' },
        { year: 2011, platform: '2010-2015-chevy-camaro' },
        { year: 2010, platform: '2010-2015-chevy-camaro' },
  
        // 1993-2002-f-body
        { year: 2002, platform: '1993-2002-f-body' },
        { year: 2001, platform: '1993-2002-f-body' },
        { year: 2000, platform: '1993-2002-f-body' },
        { year: 1999, platform: '1993-2002-f-body' },
        { year: 1998, platform: '1993-2002-f-body' },
        { year: 1997, platform: '1993-2002-f-body' },
        { year: 1996, platform: '1993-2002-f-body' },
        { year: 1995, platform: '1993-2002-f-body' },
        { year: 1994, platform: '1993-2002-f-body' },
        { year: 1993, platform: '1993-2002-f-body' },
  
        // 1982-1992-f-body
        { year: 1992, platform: '1982-1992-f-body' },
        { year: 1991, platform: '1982-1992-f-body' },
        { year: 1990, platform: '1982-1992-f-body' },
        { year: 1989, platform: '1982-1992-f-body' },
        { year: 1988, platform: '1982-1992-f-body' },
        { year: 1987, platform: '1982-1992-f-body' },
        { year: 1986, platform: '1982-1992-f-body' },
        { year: 1985, platform: '1982-1992-f-body' },
        { year: 1984, platform: '1982-1992-f-body' },
        { year: 1983, platform: '1982-1992-f-body' },
        { year: 1982, platform: '1982-1992-f-body' },
  
        // 1970-1981-f-body
        { year: 1981, platform: '1970-1981-f-body' },
        { year: 1980, platform: '1970-1981-f-body' },
        { year: 1979, platform: '1970-1981-f-body' },
        { year: 1978, platform: '1970-1981-f-body' },
        { year: 1977, platform: '1970-1981-f-body' },
        { year: 1976, platform: '1970-1981-f-body' },
        { year: 1975, platform: '1970-1981-f-body' },
        { year: 1974, platform: '1970-1981-f-body' },
        { year: 1973, platform: '1970-1981-f-body' },
        { year: 1972, platform: '1970-1981-f-body' },
        { year: 1971, platform: '1970-1981-f-body' },
        { year: 1970, platform: '1970-1981-f-body' },
  
        // 1967-1969-f-body
        { year: 1969, platform: '1967-1969-f-body' },
        { year: 1968, platform: '1967-1969-f-body' },
        { year: 1967, platform: '1967-1969-f-body' }
      ],
      'Caprice': [
        // 1991-1996-b-body
        { year: 1996, platform: '1991-1996-b-body' },
        { year: 1995, platform: '1991-1996-b-body' },
        { year: 1994, platform: '1991-1996-b-body' },
        { year: 1993, platform: '1991-1996-b-body' },
        { year: 1992, platform: '1991-1996-b-body' },
        { year: 1991, platform: '1991-1996-b-body' }
      ],
      'Corvette': [
        // 2014-2019-corvette
        { year: 2019, platform: '2014-2019-corvette'},
        { year: 2018, platform: '2014-2019-corvette'},
        { year: 2017, platform: '2014-2019-corvette'},
        { year: 2016, platform: '2014-2019-corvette'},
        { year: 2015, platform: '2014-2019-corvette'},
        { year: 2014, platform: '2014-2019-corvette'},
  
        // 2005-2013-corvette
        { year: 2013, platform: '2005-2013-corvette'},
        { year: 2012, platform: '2005-2013-corvette'},
        { year: 2011, platform: '2005-2013-corvette'},
        { year: 2010, platform: '2005-2013-corvette'},
        { year: 2009, platform: '2005-2013-corvette'},
        { year: 2008, platform: '2005-2013-corvette'},
        { year: 2007, platform: '2005-2013-corvette'},
        { year: 2006, platform: '2005-2013-corvette'},
        { year: 2005, platform: '2005-2013-corvette'},
  
        // 1997-2004-corvette
        { year: 2004, platform: '1997-2004-corvette'},
        { year: 2003, platform: '1997-2004-corvette'},
        { year: 2002, platform: '1997-2004-corvette'},
        { year: 2001, platform: '1997-2004-corvette'},
        { year: 2000, platform: '1997-2004-corvette'},
        { year: 1999, platform: '1997-2004-corvette'},
        { year: 1998, platform: '1997-2004-corvette'},
        { year: 1997, platform: '1997-2004-corvette'},
      ],
      'Chevelle': [
        // 1964-1972-a-body
        { year: 1972, platform: '1964-1972-a-body' },
        { year: 1971, platform: '1964-1972-a-body' },
        { year: 1970, platform: '1964-1972-a-body' },
        { year: 1969, platform: '1964-1972-a-body' },
        { year: 1968, platform: '1964-1972-a-body' },
        { year: 1967, platform: '1964-1972-a-body' },
        { year: 1966, platform: '1964-1972-a-body' },
        { year: 1965, platform: '1964-1972-a-body' },
        { year: 1964, platform: '1964-1972-a-body' },
      ],
      'El Camino': [
        // 1978-1987-g-body
        { year: 1987, platform: '1978-1987-g-body' },
        { year: 1986, platform: '1978-1987-g-body' },
        { year: 1985, platform: '1978-1987-g-body' },
        { year: 1984, platform: '1978-1987-g-body' },
        { year: 1983, platform: '1978-1987-g-body' },
        { year: 1982, platform: '1978-1987-g-body' },
        { year: 1981, platform: '1978-1987-g-body' },
        { year: 1980, platform: '1978-1987-g-body' },
        { year: 1979, platform: '1978-1987-g-body' },
        { year: 1978, platform: '1978-1987-g-body' },
  
        // 1964-1972-a-body
        { year: 1972, platform: '1964-1972-a-body' },
        { year: 1971, platform: '1964-1972-a-body' },
        { year: 1970, platform: '1964-1972-a-body' },
        { year: 1969, platform: '1964-1972-a-body' },
        { year: 1968, platform: '1964-1972-a-body' },
        { year: 1967, platform: '1964-1972-a-body' },
        { year: 1966, platform: '1964-1972-a-body' },
        { year: 1965, platform: '1964-1972-a-body' },
        { year: 1964, platform: '1964-1972-a-body' },
      ],
      'Impala SS': [
        // 1991-1996-b-body
        { year: 1996, platform: '1991-1996-b-body' },
        { year: 1995, platform: '1991-1996-b-body' },
        { year: 1994, platform: '1991-1996-b-body' },
        { year: 1993, platform: '1991-1996-b-body' },
        { year: 1992, platform: '1991-1996-b-body' },
        { year: 1991, platform: '1991-1996-b-body' }
      ],
      'Malibu': [
        // 1978-1987-g-body
        { year: 1987, platform: '1978-1987-g-body' },
        { year: 1986, platform: '1978-1987-g-body' },
        { year: 1985, platform: '1978-1987-g-body' },
        { year: 1984, platform: '1978-1987-g-body' },
        { year: 1983, platform: '1978-1987-g-body' },
        { year: 1982, platform: '1978-1987-g-body' },
        { year: 1981, platform: '1978-1987-g-body' },
        { year: 1980, platform: '1978-1987-g-body' },
        { year: 1979, platform: '1978-1987-g-body' },
        { year: 1978, platform: '1978-1987-g-body' },
  
        // 1964-1972-a-body
        { year: 1972, platform: '1964-1972-a-body' },
        { year: 1971, platform: '1964-1972-a-body' },
        { year: 1970, platform: '1964-1972-a-body' },
        { year: 1969, platform: '1964-1972-a-body' },
        { year: 1968, platform: '1964-1972-a-body' },
        { year: 1967, platform: '1964-1972-a-body' },
        { year: 1966, platform: '1964-1972-a-body' },
        { year: 1965, platform: '1964-1972-a-body' },
        { year: 1964, platform: '1964-1972-a-body' },
      ],
      'Monte Carlo': [
        // 1996-2006-w-body
        { year: 2006, platform: '1996-2006-w-body' },
        { year: 2005, platform: '1996-2006-w-body' },
        { year: 2004, platform: '1996-2006-w-body' },
        { year: 2003, platform: '1996-2006-w-body' },
        { year: 2002, platform: '1996-2006-w-body' },
        { year: 2001, platform: '1996-2006-w-body' },
        { year: 2000, platform: '1996-2006-w-body' },
        { year: 1999, platform: '1996-2006-w-body' },
        { year: 1998, platform: '1996-2006-w-body' },
        { year: 1997, platform: '1996-2006-w-body' },
        { year: 1996, platform: '1996-2006-w-body' },
  
        // 1978-1987-g-body
        { year: 1987, platform: '1978-1987-g-body' },
        { year: 1986, platform: '1978-1987-g-body' },
        { year: 1985, platform: '1978-1987-g-body' },
        { year: 1984, platform: '1978-1987-g-body' },
        { year: 1983, platform: '1978-1987-g-body' },
        { year: 1982, platform: '1978-1987-g-body' },
        { year: 1981, platform: '1978-1987-g-body' },
        { year: 1980, platform: '1978-1987-g-body' },
        { year: 1979, platform: '1978-1987-g-body' },
        { year: 1978, platform: '1978-1987-g-body' },
  
        // 1964-1972-a-body
        { year: 1972, platform: '1964-1972-a-body' },
        { year: 1971, platform: '1964-1972-a-body' },
        { year: 1970, platform: '1964-1972-a-body' },
        { year: 1969, platform: '1964-1972-a-body' },
        { year: 1968, platform: '1964-1972-a-body' },
        { year: 1967, platform: '1964-1972-a-body' },
        { year: 1966, platform: '1964-1972-a-body' },
        { year: 1965, platform: '1964-1972-a-body' },
        { year: 1964, platform: '1964-1972-a-body' },
      ],
      'Nova': [
        // 1975-1979-x-body
        { year: 1979, platform: '1975-1979-x-body' },
        { year: 1978, platform: '1975-1979-x-body' },
        { year: 1977, platform: '1975-1979-x-body' },
        { year: 1976, platform: '1975-1979-x-body' },
        { year: 1975, platform: '1975-1979-x-body' },
  
        // 1968-1974-x-body
        { year: 1974, platform: '1968-1974-x-body' },
        { year: 1973, platform: '1968-1974-x-body' },
        { year: 1972, platform: '1968-1974-x-body' },
        { year: 1971, platform: '1968-1974-x-body' },
        { year: 1970, platform: '1968-1974-x-body' },
        { year: 1969, platform: '1968-1974-x-body' },
        { year: 1968, platform: '1968-1974-x-body' }
      ],
      'SS': [
        // 2014-2017-chevy-ss
        { year: 2017, platform: '2014-2017-chevy-ss' },
        { year: 2016, platform: '2014-2017-chevy-ss' },
        { year: 2015, platform: '2014-2017-chevy-ss' },
        { year: 2014, platform: '2014-2017-chevy-ss' }
      ],
      'SSR': [
        // 2003-2006-chevy-ssr
        { year: 2006, platform: '2003-2006-chevy-ssr' },
        { year: 2005, platform: '2003-2006-chevy-ssr' },
        { year: 2004, platform: '2003-2006-chevy-ssr' },
        { year: 2003, platform: '2003-2006-chevy-ssr' }
      ],
      'Trailblazer': [
        // 2002-2009-trailblazer
        { year: 2009, platform: '2002-2009-trailblazer' },
        { year: 2008, platform: '2002-2009-trailblazer' },
        { year: 2007, platform: '2002-2009-trailblazer' },
        { year: 2006, platform: '2002-2009-trailblazer' },
        { year: 2005, platform: '2002-2009-trailblazer' },
        { year: 2004, platform: '2002-2009-trailblazer' },
        { year: 2003, platform: '2002-2009-trailblazer' },
        { year: 2002, platform: '2002-2009-trailblazer' }
      ]
    },
    'GMC': {
      'Envoy': [
        // 2002-2009-trailblazer
        { year: 2009, platform: '2002-2009-trailblazer' },
        { year: 2008, platform: '2002-2009-trailblazer' },
        { year: 2007, platform: '2002-2009-trailblazer' },
        { year: 2006, platform: '2002-2009-trailblazer' },
        { year: 2005, platform: '2002-2009-trailblazer' },
        { year: 2004, platform: '2002-2009-trailblazer' },
        { year: 2003, platform: '2002-2009-trailblazer' },
        { year: 2002, platform: '2002-2009-trailblazer' }
      ],
    },
    'Oldsmobile': {
      '442': [
        // 1964-1972-a-body
        { year: 1972, platform: '1964-1972-a-body' },
        { year: 1971, platform: '1964-1972-a-body' },
        { year: 1970, platform: '1964-1972-a-body' },
        { year: 1969, platform: '1964-1972-a-body' },
        { year: 1968, platform: '1964-1972-a-body' },
        { year: 1967, platform: '1964-1972-a-body' },
        { year: 1966, platform: '1964-1972-a-body' },
        { year: 1965, platform: '1964-1972-a-body' },
        { year: 1964, platform: '1964-1972-a-body' },
      ],
      'Bravada': [
        // 2002-2009-trailblazer
        { year: 2004, platform: '2002-2009-trailblazer' },
        { year: 2003, platform: '2002-2009-trailblazer' },
        { year: 2002, platform: '2002-2009-trailblazer' } 
      ],
      'Cutlass': [
        // 1978-1987-g-body
        { year: 1987, platform: '1978-1987-g-body' },
        { year: 1986, platform: '1978-1987-g-body' },
        { year: 1985, platform: '1978-1987-g-body' },
        { year: 1984, platform: '1978-1987-g-body' },
        { year: 1983, platform: '1978-1987-g-body' },
        { year: 1982, platform: '1978-1987-g-body' },
        { year: 1981, platform: '1978-1987-g-body' },
        { year: 1980, platform: '1978-1987-g-body' },
        { year: 1979, platform: '1978-1987-g-body' },
        { year: 1978, platform: '1978-1987-g-body' },
  
        // 1964-1972-a-body
        { year: 1972, platform: '1964-1972-a-body' },
        { year: 1971, platform: '1964-1972-a-body' },
        { year: 1970, platform: '1964-1972-a-body' },
        { year: 1969, platform: '1964-1972-a-body' },
        { year: 1968, platform: '1964-1972-a-body' },
        { year: 1967, platform: '1964-1972-a-body' },
        { year: 1966, platform: '1964-1972-a-body' },
        { year: 1965, platform: '1964-1972-a-body' },
        { year: 1964, platform: '1964-1972-a-body' },
      ],    
      'Intrigue': [
        // 1996-2006-w-body
        { year: 2006, platform: '1996-2006-w-body' },
        { year: 2005, platform: '1996-2006-w-body' },
        { year: 2004, platform: '1996-2006-w-body' },
        { year: 2003, platform: '1996-2006-w-body' },
        { year: 2002, platform: '1996-2006-w-body' },
        { year: 2001, platform: '1996-2006-w-body' },
        { year: 2000, platform: '1996-2006-w-body' },
        { year: 1999, platform: '1996-2006-w-body' },
        { year: 1998, platform: '1996-2006-w-body' },
        { year: 1997, platform: '1996-2006-w-body' },
        { year: 1996, platform: '1996-2006-w-body' }
      ],
    },
    'Pontiac': {
      'G8': [
        // 2008-2009-pontiac-g8
        { year: 2009, platform: '2008-2009-pontiac-g8' },
        { year: 2008, platform: '2008-2009-pontiac-g8' }
      ],
      'Grand Prix': [
        // 1996-2006-w-body
        { year: 2006, platform: '1996-2006-w-body' },
        { year: 2005, platform: '1996-2006-w-body' },
        { year: 2004, platform: '1996-2006-w-body' },
        { year: 2003, platform: '1996-2006-w-body' },
        { year: 2002, platform: '1996-2006-w-body' },
        { year: 2001, platform: '1996-2006-w-body' },
        { year: 2000, platform: '1996-2006-w-body' },
        { year: 1999, platform: '1996-2006-w-body' },
        { year: 1998, platform: '1996-2006-w-body' },
        { year: 1997, platform: '1996-2006-w-body' },
        { year: 1996, platform: '1996-2006-w-body' },
  
        // 1978-1987-g-body
        { year: 1987, platform: '1978-1987-g-body' },
        { year: 1986, platform: '1978-1987-g-body' },
        { year: 1985, platform: '1978-1987-g-body' },
        { year: 1984, platform: '1978-1987-g-body' },
        { year: 1983, platform: '1978-1987-g-body' },
        { year: 1982, platform: '1978-1987-g-body' },
        { year: 1981, platform: '1978-1987-g-body' },
        { year: 1980, platform: '1978-1987-g-body' },
        { year: 1979, platform: '1978-1987-g-body' },
        { year: 1978, platform: '1978-1987-g-body' }
      ],
      'GTO': [
        // 2004-2006-pontiac-gto 
        { year: 2006, platform: '2004-2006-pontiac-gto' },
        { year: 2005, platform: '2004-2006-pontiac-gto' },
        { year: 2004, platform: '2004-2006-pontiac-gto' },
  
        // 1964-1972-a-body
        { year: 1972, platform: '1964-1972-a-body' },
        { year: 1971, platform: '1964-1972-a-body' },
        { year: 1970, platform: '1964-1972-a-body' },
        { year: 1969, platform: '1964-1972-a-body' },
        { year: 1968, platform: '1964-1972-a-body' },
        { year: 1967, platform: '1964-1972-a-body' },
        { year: 1966, platform: '1964-1972-a-body' },
        { year: 1965, platform: '1964-1972-a-body' },
        { year: 1964, platform: '1964-1972-a-body' },
      ],
      'Firebird': [
        // 1993-2002-f-body
        { year: 2002, platform: '1993-2002-f-body' },
        { year: 2001, platform: '1993-2002-f-body' },
        { year: 2000, platform: '1993-2002-f-body' },
        { year: 1999, platform: '1993-2002-f-body' },
        { year: 1998, platform: '1993-2002-f-body' },
        { year: 1997, platform: '1993-2002-f-body' },
        { year: 1996, platform: '1993-2002-f-body' },
        { year: 1995, platform: '1993-2002-f-body' },
        { year: 1994, platform: '1993-2002-f-body' },
        { year: 1993, platform: '1993-2002-f-body' },
  
        // 1982-1992-f-body
        { year: 1992, platform: '1982-1992-f-body' },
        { year: 1991, platform: '1982-1992-f-body' },
        { year: 1990, platform: '1982-1992-f-body' },
        { year: 1989, platform: '1982-1992-f-body' },
        { year: 1988, platform: '1982-1992-f-body' },
        { year: 1987, platform: '1982-1992-f-body' },
        { year: 1986, platform: '1982-1992-f-body' },
        { year: 1985, platform: '1982-1992-f-body' },
        { year: 1984, platform: '1982-1992-f-body' },
        { year: 1983, platform: '1982-1992-f-body' },
        { year: 1982, platform: '1982-1992-f-body' },
        
        // 1970-1981-f-body
        { year: 1981, platform: '1970-1981-f-body' },
        { year: 1980, platform: '1970-1981-f-body' },
        { year: 1979, platform: '1970-1981-f-body' },
        { year: 1978, platform: '1970-1981-f-body' },
        { year: 1977, platform: '1970-1981-f-body' },
        { year: 1976, platform: '1970-1981-f-body' },
        { year: 1975, platform: '1970-1981-f-body' },
        { year: 1974, platform: '1970-1981-f-body' },
        { year: 1973, platform: '1970-1981-f-body' },
        { year: 1972, platform: '1970-1981-f-body' },
        { year: 1971, platform: '1970-1981-f-body' },
        { year: 1970, platform: '1970-1981-f-body' },
  
        // 1967-1969-f-body
        { year: 1969, platform: '1967-1969-f-body' },
        { year: 1968, platform: '1967-1969-f-body' },
        { year: 1967, platform: '1967-1969-f-body' }
      ],
      'LeMans': [
        // 1964-1972-a-body
        { year: 1972, platform: '1964-1972-a-body' },
        { year: 1971, platform: '1964-1972-a-body' },
        { year: 1970, platform: '1964-1972-a-body' },
        { year: 1969, platform: '1964-1972-a-body' },
        { year: 1968, platform: '1964-1972-a-body' },
        { year: 1967, platform: '1964-1972-a-body' },
        { year: 1966, platform: '1964-1972-a-body' },
        { year: 1965, platform: '1964-1972-a-body' },
        { year: 1964, platform: '1964-1972-a-body' },
      ],
    },
    'Dodge': {
      'Charger': [
        // 2006-2023-dodge-charger
        { year: 2023, platform: '2006-2023-dodge-charger' },
        { year: 2022, platform: '2006-2023-dodge-charger' },
        { year: 2021, platform: '2006-2023-dodge-charger' },
        { year: 2020, platform: '2006-2023-dodge-charger' },
        { year: 2019, platform: '2006-2023-dodge-charger' },
        { year: 2018, platform: '2006-2023-dodge-charger' },
        { year: 2017, platform: '2006-2023-dodge-charger' },
        { year: 2016, platform: '2006-2023-dodge-charger' },
        { year: 2015, platform: '2006-2023-dodge-charger' },
        { year: 2014, platform: '2006-2023-dodge-charger' },
        { year: 2013, platform: '2006-2023-dodge-charger' },
        { year: 2012, platform: '2006-2023-dodge-charger' },
        { year: 2011, platform: '2006-2023-dodge-charger' },
        { year: 2010, platform: '2006-2023-dodge-charger' },
        { year: 2009, platform: '2006-2023-dodge-charger' },
        { year: 2008, platform: '2006-2023-dodge-charger' },
        { year: 2007, platform: '2006-2023-dodge-charger' },
        { year: 2006, platform: '2006-2023-dodge-charger' }
      ],
      'Challenger': [
        // 2008-2023-dodge-challenger
        { year: 2023, platform: '2008-2023-dodge-challenger' },
        { year: 2022, platform: '2008-2023-dodge-challenger' },
        { year: 2021, platform: '2008-2023-dodge-challenger' },
        { year: 2020, platform: '2008-2023-dodge-challenger' },
        { year: 2019, platform: '2008-2023-dodge-challenger' },
        { year: 2018, platform: '2008-2023-dodge-challenger' },
        { year: 2017, platform: '2008-2023-dodge-challenger' },
        { year: 2016, platform: '2008-2023-dodge-challenger' },
        { year: 2015, platform: '2008-2023-dodge-challenger' },
        { year: 2014, platform: '2008-2023-dodge-challenger' },
        { year: 2013, platform: '2008-2023-dodge-challenger' },
        { year: 2012, platform: '2008-2023-dodge-challenger' },
        { year: 2011, platform: '2008-2023-dodge-challenger' },
        { year: 2010, platform: '2008-2023-dodge-challenger' },
        { year: 2009, platform: '2008-2023-dodge-challenger' },
        { year: 2008, platform: '2008-2023-dodge-challenger' }
      ]
    },
    'Saab': {
      '9-7X': [
        // 2002-2009-trailblazer
        { year: 2009, platform: '2002-2009-trailblazer' },
        { year: 2008, platform: '2002-2009-trailblazer' },
        { year: 2007, platform: '2002-2009-trailblazer' },
        { year: 2006, platform: '2002-2009-trailblazer' },
        { year: 2005, platform: '2002-2009-trailblazer' },
        { year: 2004, platform: '2002-2009-trailblazer' },
        { year: 2003, platform: '2002-2009-trailblazer' },
        { year: 2002, platform: '2002-2009-trailblazer' }
      ],
    }
  };

  export default vehicles;